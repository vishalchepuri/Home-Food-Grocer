import { Router, type IRouter } from "express";
import {
  db,
  categoriesTable,
  chefsTable,
  dishesTable,
  productsTable,
} from "@workspace/db";
import {
  ListChefsQueryParams,
  GetChefParams,
  ListProductsQueryParams,
  GetProductParams,
  SearchAllQueryParams,
} from "@workspace/api-zod";
import { and, eq, ilike, or, sql } from "drizzle-orm";

const router: IRouter = Router();

function chefRow(c: typeof chefsTable.$inferSelect) {
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
  };
}

function dishRow(
  d: typeof dishesTable.$inferSelect,
  chefName: string,
) {
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

function productRow(
  p: typeof productsTable.$inferSelect,
  categoryName: string,
) {
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
  };
}

router.get("/categories", async (_req, res) => {
  const rows = await db.select().from(categoriesTable);
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
  const conditions = [];
  if (params.cuisine) {
    conditions.push(ilike(chefsTable.cuisine, `%${params.cuisine}%`));
  }
  if (params.q) {
    conditions.push(
      or(
        ilike(chefsTable.name, `%${params.q}%`),
        ilike(chefsTable.tagline, `%${params.q}%`),
        ilike(chefsTable.cuisine, `%${params.q}%`),
      ),
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const rows = await db.select().from(chefsTable).where(where);
  res.json(rows.map(chefRow));
});

router.get("/chefs/:id", async (req, res) => {
  const { id } = GetChefParams.parse({ id: Number(req.params.id) });
  const [chef] = await db
    .select()
    .from(chefsTable)
    .where(eq(chefsTable.id, id));
  if (!chef) {
    res.status(404).json({ message: "Chef not found" });
    return;
  }
  const dishes = await db
    .select()
    .from(dishesTable)
    .where(eq(dishesTable.chefId, id));
  res.json({
    chef: chefRow(chef),
    dishes: dishes.map((d) => dishRow(d, chef.name)),
  });
});

router.get("/products", async (req, res) => {
  const params = ListProductsQueryParams.parse(req.query);
  const conditions = [];
  if (params.categoryId !== undefined) {
    conditions.push(eq(productsTable.categoryId, Number(params.categoryId)));
  }
  if (params.q) {
    conditions.push(
      or(
        ilike(productsTable.name, `%${params.q}%`),
        ilike(productsTable.description, `%${params.q}%`),
      ),
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;
  const rows = await db
    .select({
      product: productsTable,
      categoryName: categoriesTable.name,
    })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(where);
  res.json(rows.map((r) => productRow(r.product, r.categoryName)));
});

router.get("/products/:id", async (req, res) => {
  const { id } = GetProductParams.parse({ id: Number(req.params.id) });
  const [row] = await db
    .select({
      product: productsTable,
      categoryName: categoriesTable.name,
    })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(eq(productsTable.id, id));
  if (!row) {
    res.status(404).json({ message: "Product not found" });
    return;
  }
  res.json(productRow(row.product, row.categoryName));
});

router.get("/search", async (req, res) => {
  const { q } = SearchAllQueryParams.parse(req.query);
  const term = `%${q}%`;

  const chefs = await db
    .select()
    .from(chefsTable)
    .where(
      or(
        ilike(chefsTable.name, term),
        ilike(chefsTable.cuisine, term),
        ilike(chefsTable.tagline, term),
      ),
    );

  const dishesRaw = await db
    .select({ dish: dishesTable, chefName: chefsTable.name })
    .from(dishesTable)
    .innerJoin(chefsTable, eq(dishesTable.chefId, chefsTable.id))
    .where(
      or(
        ilike(dishesTable.name, term),
        ilike(dishesTable.description, term),
      ),
    );

  const products = await db
    .select({
      product: productsTable,
      categoryName: categoriesTable.name,
    })
    .from(productsTable)
    .innerJoin(categoriesTable, eq(productsTable.categoryId, categoriesTable.id))
    .where(
      or(
        ilike(productsTable.name, term),
        ilike(productsTable.description, term),
      ),
    );

  res.json({
    chefs: chefs.map(chefRow),
    dishes: dishesRaw.map((r) => dishRow(r.dish, r.chefName)),
    products: products.map((r) => productRow(r.product, r.categoryName)),
  });
});

export { dishRow, chefRow, productRow };
export default router;
