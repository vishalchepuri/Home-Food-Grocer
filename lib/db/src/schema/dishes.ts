import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  boolean,
} from "drizzle-orm/pg-core";
import { chefsTable } from "./chefs";

export const dishesTable = pgTable("dishes", {
  id: serial("id").primaryKey(),
  chefId: integer("chef_id")
    .notNull()
    .references(() => chefsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull(),
  isVeg: boolean("is_veg").notNull().default(true),
  rating: numeric("rating", { precision: 3, scale: 1 }).notNull().default("4.5"),
  spiceLevel: text("spice_level").notNull().default("mild"),
  popular: boolean("popular").notNull().default(false),
});

export type Dish = typeof dishesTable.$inferSelect;
export type InsertDish = typeof dishesTable.$inferInsert;
