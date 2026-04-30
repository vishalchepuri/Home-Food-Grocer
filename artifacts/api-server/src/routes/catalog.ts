import { Router, type IRouter } from "express";
import {
  ListChefsQueryParams,
  GetChefParams,
  ListProductsQueryParams,
  GetProductParams,
  SearchAllQueryParams,
} from "@workspace/api-zod";
import {
  type ChefDoc,
  type DishDoc,
  type ProductDoc,
  getChefById,
  getProductById,
  listCategories,
  listChefs,
  listProducts,
  searchAll,
  isChefOpen,
} from "../lib/firestoreData";

const router: IRouter = Router();

function readLimit(value: unknown, fallback: number, max: number) {
  const n = typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(n) ? Math.min(Math.max(Math.floor(n), 1), max) : fallback;
}

function chefRow(c: ChefDoc) {
  return {
    id: c.id,
    name: c.name,
    tagline: c.tagline,
    cuisine: c.cuisine,
    rating: Number(c.rating),
    etaMinutes: c.etaMinutes,
    deliveryFee: Number(c.deliveryFee),
    imageUrl: c.imageUrl,
    location: c.location,
    priceForTwo: Number(c.priceForTwo),
    isVeg: c.isVeg,
    featured: c.featured,
    opensAt: c.opensAt ?? "10:00",
    closesAt: c.closesAt ?? "22:00",
    isOpen: isChefOpen(c),
    serviceAreas: c.serviceAreas ?? [c.location],
  };
}

function dishRow(d: DishDoc, chefName: string) {
  return {
    id: d.id,
    chefId: d.chefId,
    chefName,
    name: d.name,
    description: d.description,
    price: Number(d.price),
    imageUrl: d.imageUrl,
    isVeg: d.isVeg,
    rating: Number(d.rating),
    spiceLevel: d.spiceLevel as "mild" | "medium" | "spicy",
  };
}

function productRow(p: ProductDoc, categoryName: string) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    mrp: Number(p.mrp),
    unit: p.unit,
    imageUrl: p.imageUrl,
    categoryId: p.categoryId,
    categoryName,
    inStock: p.inStock,
    essential: p.essential,
  };
}

router.get("/categories", async (_req, res) => {
  const rows = await listCategories();
  res.set("Cache-Control", "private, max-age=300");
  res.json(
    rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      kind: r.kind,
      imageUrl: r.imageUrl,
    })),
  );
});

router.get("/chefs", async (req, res) => {
  const params = ListChefsQueryParams.parse(req.query);
  const rows = await listChefs({
    cuisine: params.cuisine,
    q: params.q,
    city: typeof req.query.city === "string" ? req.query.city : undefined,
    limit: readLimit(req.query.limit, 12, 24),
  });
  res.set("Cache-Control", "private, max-age=60");
  res.json(rows.map(chefRow));
});

router.get("/chefs/:id", async (req, res) => {
  const { id } = GetChefParams.parse({ id: Number(req.params.id) });
  const row = await getChefById(id);
  if (!row) {
    res.status(404).json({ message: "Chef not found" });
    return;
  }
  res.json({
    chef: chefRow(row.chef),
    dishes: row.dishes.map((d) => dishRow(d, row.chef.name)),
  });
});

router.get("/products", async (req, res) => {
  const params = ListProductsQueryParams.parse(req.query);
  const rows = await listProducts({
    categoryId:
      params.categoryId !== undefined ? Number(params.categoryId) : undefined,
    q: params.q,
    limit: readLimit(req.query.limit, 12, 24),
  });
  res.set("Cache-Control", "private, max-age=60");
  res.json(rows.map((r) => productRow(r.product, r.categoryName)));
});

router.get("/products/:id", async (req, res) => {
  const { id } = GetProductParams.parse({ id: Number(req.params.id) });
  const row = await getProductById(id);
  if (!row) {
    res.status(404).json({ message: "Product not found" });
    return;
  }
  res.json(productRow(row.product, row.categoryName));
});

router.get("/search", async (req, res) => {
  const { q } = SearchAllQueryParams.parse(req.query);
  const rows = await searchAll(q);
  res.set("Cache-Control", "private, max-age=60");

  res.json({
    chefs: rows.chefsFound.map(chefRow),
    dishes: rows.dishesFound.map((r) => dishRow(r.dish, r.chefName)),
    products: rows.productsFound.map((r) => productRow(r.product, r.categoryName)),
  });
});

export { dishRow, chefRow, productRow };
export default router;
