import { Router, type IRouter, type Response } from "express";
import {
  CreateOrderBody,
  ListOrdersQueryParams,
  GetOrderParams,
} from "@workspace/api-zod";
import { loadUser, type AuthedRequest } from "../middlewares/auth";
import { calculatePromoDiscount } from "./promos";
import {
  type OrderDoc,
  createOrder,
  findClosedRestaurantsForItems,
  getOrderById,
  listOrdersForUser,
} from "../lib/firestoreData";

const router: IRouter = Router();
router.use(loadUser);

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
    discount: Number(row.discount),
    promoCode: row.promoCode ?? undefined,
    total: Number(row.total),
    notes: row.notes ?? undefined,
    createdAt: row.createdAt.toDate().toISOString(),
  };
}

router.get("/orders", async (req: AuthedRequest, res: Response) => {
  const params = ListOrdersQueryParams.parse(req.query);
  const rows = await listOrdersForUser({
    userId: req.userId,
    deviceId: params.deviceId,
  });
  res.json(rows.map(serializeOrder));
});

router.post("/orders", async (req: AuthedRequest, res: Response) => {
  const body = CreateOrderBody.parse(req.body);
  const closedRestaurants = await findClosedRestaurantsForItems(body.items);
  if (closedRestaurants.length > 0) {
    res.status(409).json({
      message: `${closedRestaurants.map((r) => r.name).join(", ")} is closed for delivery right now.`,
      closedRestaurants,
    });
    return;
  }

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

  const inserted = await createOrder({
    deviceId: body.deviceId,
    userId: req.userId ?? null,
    items: body.items,
    address: body.address,
    paymentMethod: body.paymentMethod,
    paymentStatus,
    paymentReference: body.paymentReference ?? null,
    status: "placed",
    subtotal: Number(subtotal.toFixed(2)),
    deliveryFee: Number(body.deliveryFee.toFixed(2)),
    tip: Number(tip.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    promoCode: appliedCode,
    total: Number(total.toFixed(2)),
    notes: body.notes ?? null,
  });
  res.status(201).json(serializeOrder(inserted));
});

router.get("/orders/:id", async (req, res) => {
  const { id } = GetOrderParams.parse({ id: Number(req.params.id) });
  const row = await getOrderById(id);
  if (!row) {
    res.status(404).json({ message: "Order not found" });
    return;
  }
  res.json(serializeOrder(row));
});

export default router;
