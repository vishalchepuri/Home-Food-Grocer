import {
  pgTable,
  serial,
  text,
  numeric,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  deviceId: text("device_id").notNull(),
  userId: text("user_id"),
  items: jsonb("items").notNull(),
  address: jsonb("address").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentStatus: text("payment_status").notNull().default("pending"),
  paymentReference: text("payment_reference"),
  status: text("status").notNull().default("placed"),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
  deliveryFee: numeric("delivery_fee", { precision: 10, scale: 2 }).notNull(),
  tip: numeric("tip", { precision: 10, scale: 2 }).notNull().default("0"),
  discount: numeric("discount", { precision: 10, scale: 2 })
    .notNull()
    .default("0"),
  promoCode: text("promo_code"),
  total: numeric("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type OrderRow = typeof ordersTable.$inferSelect;
export type InsertOrderRow = typeof ordersTable.$inferInsert;
