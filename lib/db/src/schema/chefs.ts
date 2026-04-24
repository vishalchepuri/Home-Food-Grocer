import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  boolean,
} from "drizzle-orm/pg-core";

export const chefsTable = pgTable("chefs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull(),
  cuisine: text("cuisine").notNull(),
  rating: numeric("rating", { precision: 3, scale: 1 }).notNull(),
  etaMinutes: integer("eta_minutes").notNull(),
  deliveryFee: numeric("delivery_fee", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull(),
  location: text("location").notNull(),
  priceForTwo: numeric("price_for_two", { precision: 10, scale: 2 }).notNull(),
  isVeg: boolean("is_veg").notNull().default(false),
  featured: boolean("featured").notNull().default(false),
});

export type Chef = typeof chefsTable.$inferSelect;
export type InsertChef = typeof chefsTable.$inferInsert;
