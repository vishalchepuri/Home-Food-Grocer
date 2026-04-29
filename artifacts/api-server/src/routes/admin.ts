import { Router, type IRouter, type Response } from "express";
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
import { loadUser, requireAdmin, type AuthedRequest } from "../middlewares/auth";
import { clearPublicCache } from "../middlewares/publicCache";
import {
  type ChefDoc,
  type OrderDoc,
  type OrderStatus,
  type ProductDoc,
  createChef,
  createProduct,
  deleteChef,
  deleteProduct,
  getAdminStats,
  listAdminChefs,
  listAdminOrders,
  listAdminProducts,
  updateChef,
  updateOrderStatus,
  updateProduct,
} from "../lib/firestoreData";

const router: IRouter = Router();

router.use("/admin", loadUser, requireAdmin);

function serializeOrder(row: OrderDoc) {
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
    createdAt: row.createdAt.toDate().toISOString(),
  };
}

function serializeChef(row: ChefDoc) {
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

function serializeProduct(row: ProductDoc) {
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
  const stats = await getAdminStats();
  res.json(stats);
});

router.get("/admin/orders", async (req: AuthedRequest, res: Response) => {
  const params = AdminListOrdersQueryParams.parse(req.query);
  const rows = await listAdminOrders(params.status as OrderStatus | undefined);
  res.json(rows.map(serializeOrder));
});

router.patch(
  "/admin/orders/:id/status",
  async (req: AuthedRequest, res: Response) => {
    const { id } = AdminUpdateOrderStatusParams.parse({
      id: Number(req.params.id),
    });
    const body = AdminUpdateOrderStatusBody.parse(req.body);
    const updated = await updateOrderStatus(id, body.status);
    if (!updated) {
      res.status(404).json({ message: "Order not found" });
      return;
    }
    res.json(serializeOrder(updated));
  },
);

router.get("/admin/chefs", async (_req: AuthedRequest, res: Response) => {
  const rows = await listAdminChefs();
  res.json(rows.map(serializeChef));
});

router.post("/admin/chefs", async (req: AuthedRequest, res: Response) => {
  const body = AdminCreateChefBody.parse(req.body);
  const inserted = await createChef({
    name: body.name,
    tagline: body.tagline,
    cuisine: body.cuisine,
    rating: body.rating,
    etaMinutes: body.etaMinutes,
    deliveryFee: body.deliveryFee,
    imageUrl: body.imageUrl,
    location: body.location,
    priceForTwo: body.priceForTwo,
    isVeg: body.isVeg,
    featured: body.featured ?? false,
  });
  clearPublicCache();
  res.status(201).json(serializeChef(inserted));
});

router.patch(
  "/admin/chefs/:id",
  async (req: AuthedRequest, res: Response) => {
    const { id } = AdminUpdateChefParams.parse({ id: Number(req.params.id) });
    const body = AdminUpdateChefBody.parse(req.body);
    const updated = await updateChef(id, {
      name: body.name,
      tagline: body.tagline,
      cuisine: body.cuisine,
      rating: body.rating,
      etaMinutes: body.etaMinutes,
      deliveryFee: body.deliveryFee,
      imageUrl: body.imageUrl,
      location: body.location,
      priceForTwo: body.priceForTwo,
      isVeg: body.isVeg,
      featured: body.featured ?? false,
    });
    if (!updated) {
      res.status(404).json({ message: "Chef not found" });
      return;
    }
    clearPublicCache();
    res.json(serializeChef(updated));
  },
);

router.delete(
  "/admin/chefs/:id",
  async (req: AuthedRequest, res: Response) => {
    const { id } = AdminDeleteChefParams.parse({ id: Number(req.params.id) });
    await deleteChef(id);
    clearPublicCache();
    res.status(204).send();
  },
);

router.get("/admin/products", async (_req: AuthedRequest, res: Response) => {
  const rows = await listAdminProducts();
  res.json(rows.map(serializeProduct));
});

router.post("/admin/products", async (req: AuthedRequest, res: Response) => {
  const body = AdminCreateProductBody.parse(req.body);
  const inserted = await createProduct({
    name: body.name,
    description: body.description,
    price: body.price,
    mrp: body.mrp,
    unit: body.unit,
    imageUrl: body.imageUrl,
    categoryId: body.categoryId,
    inStock: body.inStock ?? true,
    essential: body.essential ?? false,
  });
  clearPublicCache();
  res.status(201).json(serializeProduct(inserted));
});

router.patch(
  "/admin/products/:id",
  async (req: AuthedRequest, res: Response) => {
    const { id } = AdminUpdateProductParams.parse({
      id: Number(req.params.id),
    });
    const body = AdminUpdateProductBody.parse(req.body);
    const updated = await updateProduct(id, {
      name: body.name,
      description: body.description,
      price: body.price,
      mrp: body.mrp,
      unit: body.unit,
      imageUrl: body.imageUrl,
      categoryId: body.categoryId,
      inStock: body.inStock ?? true,
      essential: body.essential ?? false,
    });
    if (!updated) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    clearPublicCache();
    res.json(serializeProduct(updated));
  },
);

router.delete(
  "/admin/products/:id",
  async (req: AuthedRequest, res: Response) => {
    const { id } = AdminDeleteProductParams.parse({
      id: Number(req.params.id),
    });
    await deleteProduct(id);
    clearPublicCache();
    res.status(204).send();
  },
);

export default router;
