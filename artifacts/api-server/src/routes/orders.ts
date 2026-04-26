import { Router, type IRouter, type Response } from "express";
import { db, ordersTable } from "@workspace/db";
import {
  CreateOrderBody,
  ListOrdersQueryParams,
  GetOrderParams,
} from "@workspace/api-zod";
import { eq, desc, or } from "drizzle-orm";
import { loadUser, type AuthedRequest } from "../middlewares/auth";
import { calculatePromoDiscount } from "./promos";

const router: IRouter = Router();
router.use(loadUser);

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
    discount: Number(row.discount),
    promoCode: row.promoCode ?? undefined,
    total: Number(row.total),
    notes: row.notes ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

router.get("/orders", async (req: AuthedRequest, res: Response) => {
  const params = ListOrdersQueryParams.parse(req.query);
  const rows = await db
    .select()
    .from(ordersTable)
    .where(
      req.userId
        ? or(
            eq(ordersTable.userId, req.userId),
            eq(ordersTable.deviceId, params.deviceId),
          )
        : eq(ordersTable.deviceId, params.deviceId),
    )
    .orderBy(desc(ordersTable.createdAt));
  res.json(rows.map(serializeOrder));
});

router.post("/orders", async (req: AuthedRequest, res: Response) => {
  const body = CreateOrderBody.parse(req.body);
  const subtotal = body.items.reduce(
    (sum, it) => sum + it.unitPrice * it.quantity,
    0,
  );
  const tip = body.tip ?? 0;
  const { discount, appliedCode } = calculatePromoDiscount(
    body.promoCode,
    body.items,
    body.deliveryFee,
  );
  const total = Math.max(0, subtotal + body.deliveryFee + tip - discount);

  const isOnline = body.paymentMethod === "online";
  const paymentStatus = isOnline ? "paid" : "pending";

  const [inserted] = await db
    .insert(ordersTable)
    .values({
      deviceId: body.deviceId,
      userId: req.userId ?? null,
      items: body.items,
      address: body.address,
      paymentMethod: body.paymentMethod,
      paymentStatus,
      paymentReference: body.paymentReference ?? null,
      status: "placed",
      subtotal: subtotal.toFixed(2),
      deliveryFee: body.deliveryFee.toFixed(2),
      tip: tip.toFixed(2),
      discount: discount.toFixed(2),
      promoCode: appliedCode,
      total: total.toFixed(2),
      notes: body.notes ?? null,
    })
    .returning();

  res.status(201).json(serializeOrder(inserted));
});

router.get("/orders/:id", async (req, res) => {
  const { id } = GetOrderParams.parse({ id: Number(req.params.id) });
  const [row] = await db
    .select()
    .from(ordersTable)
    .where(eq(ordersTable.id, id));
  if (!row) {
    res.status(404).json({ message: "Order not found" });
    return;
  }
  res.json(serializeOrder(row));
});

export default router;
