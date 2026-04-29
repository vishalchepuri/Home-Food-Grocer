import { Router, type IRouter } from "express";
import { chefRow, dishRow, productRow } from "./catalog";
import {
  getFeaturedChefs,
  getGroceryEssentials,
  getPopularDishes,
  listOffers,
} from "../lib/firestoreData";

const router: IRouter = Router();

router.get("/dashboard/featured-chefs", async (req, res) => {
  const city = typeof req.query.city === "string" ? req.query.city.trim() : undefined;
  const rows = await getFeaturedChefs(city);
  res.set("Cache-Control", "private, max-age=60");
  res.json(rows.map(chefRow));
});

router.get("/dashboard/popular-dishes", async (req, res) => {
  const city = typeof req.query.city === "string" ? req.query.city.trim() : undefined;
  const rows = await getPopularDishes(city);
  res.set("Cache-Control", "private, max-age=60");
  res.json(rows.map((r) => dishRow(r.dish, r.chefName)));
});

router.get("/dashboard/grocery-essentials", async (_req, res) => {
  const rows = await getGroceryEssentials();
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
