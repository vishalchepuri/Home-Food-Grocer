import { Router, type IRouter, type Response } from "express";
import {
  db,
  ordersTable,
  chefsTable,
  productsTable,
} from "@workspace/db";
import {
  AdminListOrdersQueryParams,
  AdminUpdateOrderStatusParams,
  AdminUpdateOrderStatusBody,
  AdminUpdateChefParams,
  AdminCreateChefBody,
  AdminUpdateChefBody,
  AdminDeleteChefParams,
  AdminUpdateProductParams,
  AdminCreateProductBody,
  AdminUpdateProductBody,
  AdminDeleteProductParams,
} from "@workspace/api-zod";
import { desc, eq, sql } from "drizzle-orm";
import { loadUser, requireAdmin, type AuthedRequest } from "../middlewares/auth";

const router: IRouter = Router();

router.use("/admin", loadUser, requireAdmin);

function serializeOrder(row: typeof ordersTable.$inferSelect) {
  return {
    id: row.id,
    deviceId: row.deviceId,
    items: row.items as unknown,
    address: row.address as unknown,
    paymentMethod: row.paymentMethod as "cod" | "online",
    paymentStatus: row.paymentStatus as "pending" | "paid" | "failed",
    paymentReference: row.paymentReference ?? undefined,
    status: row.status as
      | "placed"
      | "preparing"
      | "out_for_delivery"
      | "delivered"
      | "cancelled",
    subtotal: Number(row.subtotal),
    deliveryFee: Number(row.deliveryFee),
    tip: Number(row.tip),
    total: Number(row.total),
    notes: row.notes ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

function serializeChef(row: typeof chefsTable.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    cuisine: row.cuisine,
    rating: Number(row.rating),
    etaMinutes: row.etaMinutes,
    deliveryFee: Number(row.deliveryFee),
    imageUrl: row.imageUrl,
    location: row.location,
    priceForTwo: Number(row.priceForTwo),
    isVeg: row.isVeg,
    featured: row.featured,
  };
}

function serializeProduct(row: typeof productsTable.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    mrp: Number(row.mrp),
    unit: row.unit,
    imageUrl: row.imageUrl,
    categoryId: row.categoryId,
    categoryName: "",
    inStock: row.inStock,
    essential: row.essential,
  };
}

router.get("/admin/stats", async (_req: AuthedRequest, res: Response) => {
  const orders = await db.select().from(ordersTable);
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const ordersByStatus: Record<string, number> = {};
  for (const o of orders) {
    ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
  }

  const [{ count: totalChefs }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(chefsTable);
  const [{ count: totalProducts }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(productsTable);

  const byDay = new Map<string, { revenue: number; orders: number }>();
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    byDay.set(key, { revenue: 0, orders: 0 });
  }
  for (const o of orders) {
    const key = o.createdAt.toISOString().slice(0, 10);
    if (byDay.has(key)) {
      const cur = byDay.get(key)!;
      cur.revenue += Number(o.total);
      cur.orders += 1;
    }
  }
  const revenueByDay = Array.from(byDay.entries()).map(([day, v]) => ({
    day,
    revenue: Number(v.revenue.toFixed(2)),
    orders: v.orders,
  }));

  res.json({
    totalOrders,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalProducts,
    totalChefs,
    ordersByStatus,
    revenueByDay,
  });
});

router.get("/admin/orders", async (req: AuthedRequest, res: Response) => {
  const params = AdminListOrdersQueryParams.parse(req.query);
  const rows = await (params.status
    ? db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.status, params.status))
        .orderBy(desc(ordersTable.createdAt))
    : db.select().from(ordersTable).orderBy(desc(ordersTable.createdAt)));
  res.json(rows.map(serializeOrder));
});

router.patch(
  "/admin/orders/:id/status",
  async (req: AuthedRequest, res: Response) => {
    const { id } = AdminUpdateOrderStatusParams.parse({
      id: Number(req.params.id),
    });
    const body = AdminUpdateOrderStatusBody.parse(req.body);
    const [updated] = await db
      .update(ordersTable)
      .set({ status: body.status })
      .where(eq(ordersTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.json(serializeOrder(updated));
  },
);

router.get("/admin/chefs", async (_req: AuthedRequest, res: Response) => {
  const rows = await db.select().from(chefsTable).orderBy(chefsTable.id);
  res.json(rows.map(serializeChef));
});

router.post("/admin/chefs", async (req: AuthedRequest, res: Response) => {
  const body = AdminCreateChefBody.parse(req.body);
  const [inserted] = await db
    .insert(chefsTable)
    .values({
      name: body.name,
      tagline: body.tagline,
      cuisine: body.cuisine,
      rating: body.rating.toString(),
      etaMinutes: body.etaMinutes,
      deliveryFee: body.deliveryFee.toString(),
      imageUrl: body.imageUrl,
      location: body.location,
      priceForTwo: body.priceForTwo.toString(),
      isVeg: body.isVeg,
      featured: body.featured ?? false,
    })
    .returning();
  res.status(201).json(serializeChef(inserted));
});

router.patch(
  "/admin/chefs/:id",
  async (req: AuthedRequest, res: Response) => {
    const { id } = AdminUpdateChefParams.parse({ id: Number(req.params.id) });
    const body = AdminUpdateChefBody.parse(req.body);
    const [updated] = await db
      .update(chefsTable)
      .set({
        name: body.name,
        tagline: body.tagline,
        cuisine: body.cuisine,
        rating: body.rating.toString(),
        etaMinutes: body.etaMinutes,
        deliveryFee: body.deliveryFee.toString(),
        imageUrl: body.imageUrl,
        location: body.location,
        priceForTwo: body.priceForTwo.toString(),
        isVeg: body.isVeg,
        featured: body.featured ?? false,
      })
      .where(eq(chefsTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ message: "Chef not found" });
      return;
    }
    res.json(serializeChef(updated));
  },
);

router.delete(
  "/admin/chefs/:id",
  async (req: AuthedRequest, res: Response) => {
    const { id } = AdminDeleteChefParams.parse({ id: Number(req.params.id) });
    await db.delete(chefsTable).where(eq(chefsTable.id, id));
    res.status(204).send();
  },
);

router.get("/admin/products", async (_req: AuthedRequest, res: Response) => {
  const rows = await db.select().from(productsTable).orderBy(productsTable.id);
  res.json(rows.map(serializeProduct));
});

router.post("/admin/products", async (req: AuthedRequest, res: Response) => {
  const body = AdminCreateProductBody.parse(req.body);
  const [inserted] = await db
    .insert(productsTable)
    .values({
      name: body.name,
      description: body.description,
      price: body.price.toString(),
      mrp: body.mrp.toString(),
      unit: body.unit,
      imageUrl: body.imageUrl,
      categoryId: body.categoryId,
      inStock: body.inStock ?? true,
      essential: body.essential ?? false,
    })
    .returning();
  res.status(201).json(serializeProduct(inserted));
});

router.patch(
  "/admin/products/:id",
  async (req: AuthedRequest, res: Response) => {
    const { id } = AdminUpdateProductParams.parse({
      id: Number(req.params.id),
    });
    const body = AdminUpdateProductBody.parse(req.body);
    const [updated] = await db
      .update(productsTable)
      .set({
        name: body.name,
        description: body.description,
        price: body.price.toString(),
        mrp: body.mrp.toString(),
        unit: body.unit,
        imageUrl: body.imageUrl,
        categoryId: body.categoryId,
        inStock: body.inStock ?? true,
        essential: body.essential ?? false,
      })
      .where(eq(productsTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.json(serializeProduct(updated));
  },
);

router.delete(
  "/admin/products/:id",
  async (req: AuthedRequest, res: Response) => {
    const { id } = AdminDeleteProductParams.parse({
      id: Number(req.params.id),
    });
    await db.delete(productsTable).where(eq(productsTable.id, id));
    res.status(204).send();
  },
);

export default router;
