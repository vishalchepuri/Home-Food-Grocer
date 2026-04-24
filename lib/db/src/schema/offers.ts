import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const offersTable = pgTable("offers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull(),
  code: text("code").notNull(),
  accentColor: text("accent_color").notNull(),
});

export type Offer = typeof offersTable.$inferSelect;
export type InsertOffer = typeof offersTable.$inferInsert;
