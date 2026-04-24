import { Router, type IRouter } from "express";
import {
  db,
  chefsTable,
  dishesTable,
  productsTable,
  categoriesTable,
  offersTable,
} from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { chefRow, dishRow, productRow } from "./catalog";

const router: IRouter = Router();

router.get("/dashboard/featured-chefs", async (_req, res) => {
  const rows = await db
    .select()
    .from(chefsTable)
    .where(eq(chefsTable.featured, true))
    .orderBy(desc(chefsTable.rating));
  res.json(rows.map(chefRow));
});

router.get("/dashboard/popular-dishes", async (_req, res) => {
  const rows = await db
    .select({ dish: dishesTable, chefName: chefsTable.name })
    .from(dishesTable)
    .innerJoin(chefsTable, eq(dishesTable.chefId, chefsTable.id))
    .where(eq(dishesTable.popular, true))
    .orderBy(desc(dishesTable.rating));
  res.json(rows.map((r) => dishRow(r.dish, r.chefName)));
});

router.get("/dashboard/grocery-essentials", async (_req, res) => {
  const rows = await db
    .select({ product: productsTable, categoryName: categoriesTable.name })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.essential, true));
  res.json(rows.map((r) => productRow(r.product, r.categoryName)));
});

router.get("/dashboard/offers", async (_req, res) => {
  const rows = await db.select().from(offersTable);
  res.json(
    rows.map((o) => ({
      id: o.id,
      title: o.title,
      subtitle: o.subtitle,
      code: o.code,
      accentColor: o.accentColor,
    })),
  );
});

export default router;
