import { Router, type IRouter } from "express";
import { chefRow, dishRow, productRow } from "./catalog";
import {
  getFeaturedChefs,
  getGroceryEssentials,
  getPopularDishes,
  listOffers,
} from "../lib/firestoreData";

const router: IRouter = Router();

function readLimit(value: unknown, fallback: number, max: number) {
  const n = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(n) ? Math.min(Math.max(Math.floor(n), 1), max) : fallback;
}

router.get("/dashboard/featured-chefs", async (req, res) => {
  const city = typeof req.query.city === "string" ? req.query.city.trim() : undefined;
  const rows = await getFeaturedChefs(city, readLimit(req.query.limit, 4, 8));
  res.set("Cache-Control", "private, max-age=60");
  res.json(rows.map(chefRow));
});

router.get("/dashboard/popular-dishes", async (req, res) => {
  const city = typeof req.query.city === "string" ? req.query.city.trim() : undefined;
  const rows = await getPopularDishes(city, readLimit(req.query.limit, 6, 12));
  res.set("Cache-Control", "private, max-age=60");
  res.json(rows.map((r) => dishRow(r.dish, r.chefName)));
});

router.get("/dashboard/grocery-essentials", async (req, res) => {
  const rows = await getGroceryEssentials(readLimit(req.query.limit, 8, 18));
  res.set("Cache-Control", "private, max-age=60");
  res.json(rows.map((r) => productRow(r.product, r.categoryName)));
});

router.get("/dashboard/offers", async (_req, res) => {
  const rows = await listOffers();
  res.set("Cache-Control", "private, max-age=300");
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
