import {
  FieldValue,
  Timestamp,
  type CollectionReference,
  type DocumentData,
} from "firebase-admin/firestore";
import { firestore } from "./firebaseAdmin";

type Kind = "home_food" | "grocery";
type PaymentMethod = "cod" | "online";
type PaymentStatus = "pending" | "paid" | "failed";
export type OrderStatus =
  | "placed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type CategoryDoc = {
  id: number;
  name: string;
  slug: string;
  kind: Kind;
  imageUrl: string;
};

export type ChefDoc = {
  id: number;
  name: string;
  tagline: string;
  cuisine: string;
  rating: number;
  etaMinutes: number;
  deliveryFee: number;
  imageUrl: string;
  location: string;
  priceForTwo: number;
  isVeg: boolean;
  featured: boolean;
  opensAt?: string;
  closesAt?: string;
  serviceAreas?: string[];
};

export type DishDoc = {
  id: number;
  chefId: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isVeg: boolean;
  rating: number;
  spiceLevel: "mild" | "medium" | "spicy";
  popular: boolean;
};

export type ProductDoc = {
  id: number;
  name: string;
  description: string;
  price: number;
  mrp: number;
  unit: string;
  imageUrl: string;
  categoryId: number;
  inStock: boolean;
  essential: boolean;
};

export type OfferDoc = {
  id: number;
  title: string;
  subtitle: string;
  code: string;
  accentColor: string;
};

export type OrderDoc = {
  id: number;
  deviceId: string;
  userId: string | null;
  items: unknown[];
  address: unknown;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentReference: string | null;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  tip: number;
  discount: number;
  promoCode: string | null;
  total: number;
  notes: string | null;
  createdAt: Timestamp;
};

function collection<T extends DocumentData>(name: string) {
  return firestore.collection(name) as CollectionReference<T>;
}

const categories = collection<CategoryDoc>("categories");
const chefs = collection<ChefDoc>("chefs");
const dishes = collection<DishDoc>("dishes");
const products = collection<ProductDoc>("products");
const offers = collection<OfferDoc>("offers");
const orders = collection<OrderDoc>("orders");
const counters = firestore.collection("meta").doc("counters");

async function getNextId(counterName: string): Promise<number> {
  return await firestore.runTransaction(async (tx) => {
    const snap = await tx.get(counters);
    const data = (snap.data() ?? {}) as Record<string, number>;
    const next = (Number(data[counterName] ?? 0) || 0) + 1;
    tx.set(counters, { [counterName]: next }, { merge: true });
    return next;
  });
}

function norm(text: string): string {
  return text.trim().toLowerCase();
}

export function isChefOpen(
  chef: Pick<ChefDoc, "opensAt" | "closesAt">,
  now = new Date(),
) {
  const opensAt = chef.opensAt ?? "10:00";
  const closesAt = chef.closesAt ?? "22:00";
  const [openHour, openMinute] = opensAt.split(":").map(Number);
  const [closeHour, closeMinute] = closesAt.split(":").map(Number);
  const open = openHour * 60 + openMinute;
  const close = closeHour * 60 + closeMinute;
  const current = now.getHours() * 60 + now.getMinutes();

  if (open === close) return true;
  if (open < close) return current >= open && current < close;
  return current >= open || current < close;
}

export async function listCategories() {
  const snap = await categories.get();
  return snap.docs.map((d) => d.data());
}

export async function listChefs(params: {
  cuisine?: string;
  q?: string;
  city?: string;
  limit?: number;
}) {
  const cuisine = params.cuisine ? norm(params.cuisine) : null;
  const q = params.q ? norm(params.q) : null;
  const city = params.city ? norm(params.city) : null;
  let query: FirebaseFirestore.Query<ChefDoc> = chefs;

  if (params.city) query = query.where("location", "==", params.city);
  if (params.cuisine) query = query.where("cuisine", "==", params.cuisine);

  const limit = Math.min(Math.max(params.limit ?? (q ? 20 : 12), 1), 24);
  const snap = await query.limit(limit).get();
  return snap.docs
    .map((d) => d.data())
    .filter((c) => {
      if (cuisine && norm(c.cuisine) !== cuisine) return false;
      if (
        city &&
        norm(c.location) !== city &&
        !(c.serviceAreas ?? []).some((area) => norm(area) === city)
      ) {
        return false;
      }
      if (!q) return true;
      return (
        norm(c.name).includes(q) ||
        norm(c.tagline).includes(q) ||
        norm(c.cuisine).includes(q)
      );
    });
}

export async function getChefById(id: number) {
  const chefSnap = await chefs.doc(String(id)).get();
  if (!chefSnap.exists) return null;
  const chef = chefSnap.data()!;

  const dishesSnap = await dishes.where("chefId", "==", id).get();
  return {
    chef,
    dishes: dishesSnap.docs.map((d) => d.data()),
  };
}

export async function listProducts(params: {
  categoryId?: number;
  q?: string;
  limit?: number;
}) {
  const q = params.q ? norm(params.q) : null;
  let prodQuery: FirebaseFirestore.Query<ProductDoc> = products;
  if (params.categoryId !== undefined) {
    prodQuery = prodQuery.where("categoryId", "==", params.categoryId);
  }
  const limit = Math.min(Math.max(params.limit ?? (q ? 20 : 12), 1), 24);
  const prodSnap = await prodQuery.limit(limit).get();
  const productRows = prodSnap.docs
    .map((d) => d.data())
    .filter((p) => {
      if (!q) return true;
      return norm(p.name).includes(q) || norm(p.description).includes(q);
    });
  const categoryIds = Array.from(new Set(productRows.map((p) => p.categoryId)));
  const categoryRows = await Promise.all(
    categoryIds.map((id) => categories.doc(String(id)).get()),
  );
  const categoryMap = new Map<number, string>();
  for (const snap of categoryRows) {
    if (snap.exists) categoryMap.set(snap.data()!.id, snap.data()!.name);
  }
  return productRows.map((p) => ({
    product: p,
    categoryName: categoryMap.get(p.categoryId) ?? "",
  }));
}

export async function getProductById(id: number) {
  const prodSnap = await products.doc(String(id)).get();
  if (!prodSnap.exists) return null;
  const product = prodSnap.data()!;
  const catSnap = await categories.doc(String(product.categoryId)).get();
  const categoryName = catSnap.exists ? catSnap.data()!.name : "";
  return { product, categoryName };
}

export async function searchAll(q: string) {
  const query = norm(q);
  const chefRows = await chefs.where("cuisine", "==", q).limit(8).get();

  const chefsFound = chefRows.docs
    .map((d) => d.data())
    .filter((c) => norm(c.cuisine) === query || norm(c.name).includes(query));

  const chefNameById = new Map<number, string>();
  for (const c of chefsFound) {
    chefNameById.set(c.id, c.name);
  }
  const dishSnaps = await Promise.all(
    chefsFound.slice(0, 6).map((chef) =>
      dishes.where("chefId", "==", chef.id).limit(2).get(),
    ),
  );

  const dishesFound = dishSnaps
    .flatMap((snap) => snap.docs.map((d) => d.data()))
    .map((dish) => ({ dish, chefName: chefNameById.get(dish.chefId) ?? "" }));

  const productSnap = await products.limit(12).get();
  const productsFound = productSnap.docs
    .map((d) => d.data())
    .filter((p) => norm(p.name).includes(query))
    .slice(0, 12)
    .map((product) => ({ product, categoryName: "" }));

  return { chefsFound, dishesFound, productsFound };
}

export async function getFeaturedChefs(city?: string, limit = 4) {
  let query: FirebaseFirestore.Query<ChefDoc> = chefs.where("featured", "==", true);
  if (city) query = query.where("location", "==", city);
  const snap = await query.limit(Math.min(Math.max(limit, 1), 8)).get();
  return snap.docs.map((d) => d.data()).sort((a, b) => b.rating - a.rating);
}

export async function getPopularDishes(city?: string, limit = 6) {
  let chefQuery: FirebaseFirestore.Query<ChefDoc> = chefs.where("featured", "==", true);
  if (city) chefQuery = chefQuery.where("location", "==", city);
  const cappedLimit = Math.min(Math.max(limit, 1), 12);
  const chefSnap = await chefQuery.limit(Math.min(cappedLimit, 6)).get();
  const chefRows = chefSnap.docs.map((d) => d.data());
  const dishSnaps = await Promise.all(
    chefRows.map((chef) => dishes.where("chefId", "==", chef.id).limit(1).get()),
  );
  const chefById = new Map(chefRows.map((chef) => [chef.id, chef]));
  return dishSnaps
    .flatMap((snap) => snap.docs.map((d) => d.data()))
    .slice(0, cappedLimit)
    .map((dish) => {
      const chef = chefById.get(dish.chefId);
      return {
        dish,
        chefName: chef?.name ?? "",
        chefLocation: chef?.location ?? "",
        serviceAreas: chef?.serviceAreas ?? (chef ? [chef.location] : []),
      };
    });
}

export async function getGroceryEssentials(limit = 8) {
  const prodSnap = await products
    .where("essential", "==", true)
    .limit(Math.min(Math.max(limit, 1), 18))
    .get();
  const categoryIds = Array.from(
    new Set(prodSnap.docs.map((d) => d.data().categoryId)),
  );
  const categorySnaps = await Promise.all(
    categoryIds.map((id) => categories.doc(String(id)).get()),
  );
  const categoryNameById = new Map(
    categorySnaps
      .filter((snap) => snap.exists)
      .map((snap) => [snap.data()!.id, snap.data()!.name]),
  );
  return prodSnap.docs.map((d) => d.data()).map((product) => ({
    product,
    categoryName: categoryNameById.get(product.categoryId) ?? "",
  }));
}

export async function listOffers() {
  const snap = await offers.get();
  return snap.docs.map((d) => d.data());
}

export async function listOrdersForUser(params: {
  userId?: string;
  deviceId: string;
}) {
  const snap = await orders.get();
  return snap.docs
    .map((d) => d.data())
    .filter((o) =>
      params.userId
        ? o.userId === params.userId || o.deviceId === params.deviceId
        : o.deviceId === params.deviceId,
    )
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
}

export async function createOrder(input: Omit<OrderDoc, "id" | "createdAt">) {
  const id = await getNextId("orders");
  const doc: OrderDoc = { ...input, id, createdAt: Timestamp.now() };
  await orders.doc(String(id)).set(doc);
  return doc;
}

export async function getOrderById(id: number) {
  const snap = await orders.doc(String(id)).get();
  return snap.exists ? snap.data()! : null;
}

export async function findClosedRestaurantsForItems(items: unknown[]) {
  const dishItems = (items as Array<{ kind?: string; refId?: number }>)
    .filter((item) => item.kind === "dish" && typeof item.refId === "number");
  if (dishItems.length === 0) return [];

  const dishSnaps = await Promise.all(
    dishItems.map((item) => dishes.doc(String(item.refId)).get()),
  );
  const chefIds = Array.from(
    new Set(
      dishSnaps
        .filter((snap) => snap.exists)
        .map((snap) => snap.data()!.chefId),
    ),
  );
  const chefSnaps = await Promise.all(
    chefIds.map((id) => chefs.doc(String(id)).get()),
  );

  return chefSnaps
    .filter((snap) => snap.exists)
    .map((snap) => snap.data()!)
    .filter((chef) => !isChefOpen(chef))
    .map((chef) => ({
      id: chef.id,
      name: chef.name,
      opensAt: chef.opensAt ?? "10:00",
      closesAt: chef.closesAt ?? "22:00",
    }));
}

export async function listAdminOrders(status?: OrderStatus) {
  const snap = await orders.get();
  return snap.docs
    .map((d) => d.data())
    .filter((o) => (status ? o.status === status : true))
    .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
}

export async function updateOrderStatus(id: number, status: OrderStatus) {
  const ref = orders.doc(String(id));
  const existing = await ref.get();
  if (!existing.exists) return null;
  await ref.set({ status }, { merge: true });
  const updated = await ref.get();
  return updated.data()!;
}

export async function listAdminChefs() {
  const snap = await chefs.get();
  return snap.docs.map((d) => d.data()).sort((a, b) => a.id - b.id);
}

export async function createChef(input: Omit<ChefDoc, "id">) {
  const id = await getNextId("chefs");
  const doc: ChefDoc = { id, ...input };
  await chefs.doc(String(id)).set(doc);
  return doc;
}

export async function updateChef(id: number, input: Omit<ChefDoc, "id">) {
  const ref = chefs.doc(String(id));
  const snap = await ref.get();
  if (!snap.exists) return null;
  const doc: ChefDoc = { id, ...input };
  await ref.set(doc);
  return doc;
}

export async function deleteChef(id: number) {
  await chefs.doc(String(id)).delete();
}

export async function listAdminProducts() {
  const snap = await products.get();
  return snap.docs.map((d) => d.data()).sort((a, b) => a.id - b.id);
}

export async function createProduct(input: Omit<ProductDoc, "id">) {
  const id = await getNextId("products");
  const doc: ProductDoc = { id, ...input };
  await products.doc(String(id)).set(doc);
  return doc;
}

export async function updateProduct(id: number, input: Omit<ProductDoc, "id">) {
  const ref = products.doc(String(id));
  const snap = await ref.get();
  if (!snap.exists) return null;
  const doc: ProductDoc = { id, ...input };
  await ref.set(doc);
  return doc;
}

export async function deleteProduct(id: number) {
  await products.doc(String(id)).delete();
}

export async function getAdminStats() {
  const [orderRows, chefRows, productRows] = await Promise.all([
    listAdminOrders(),
    listAdminChefs(),
    listAdminProducts(),
  ]);

  const totalOrders = orderRows.length;
  const totalRevenue = orderRows.reduce((s, o) => s + o.total, 0);
  const ordersByStatus: Record<string, number> = {};
  for (const o of orderRows) {
    ordersByStatus[o.status] = (ordersByStatus[o.status] ?? 0) + 1;
  }

  const byDay = new Map<string, { revenue: number; orders: number }>();
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    byDay.set(d.toISOString().slice(0, 10), { revenue: 0, orders: 0 });
  }
  for (const o of orderRows) {
    const key = o.createdAt.toDate().toISOString().slice(0, 10);
    const row = byDay.get(key);
    if (!row) continue;
    row.orders += 1;
    row.revenue += o.total;
  }

  return {
    totalOrders,
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalProducts: productRows.length,
    totalChefs: chefRows.length,
    liveRestaurants: chefRows.filter((chef) => isChefOpen(chef)).length,
    closedRestaurants: chefRows.filter((chef) => !isChefOpen(chef)).length,
    averageOrderValue:
      totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0,
    pendingOrders: orderRows.filter((o) =>
      ["placed", "preparing", "out_for_delivery"].includes(o.status),
    ).length,
    ordersByStatus,
    revenueByDay: Array.from(byDay.entries()).map(([day, val]) => ({
      day,
      revenue: Number(val.revenue.toFixed(2)),
      orders: val.orders,
    })),
  };
}

export async function claimFirstAdmin(userId: string) {
  const metaRef = firestore.collection("meta").doc("admin");
  return await firestore.runTransaction(async (tx) => {
    const snap = await tx.get(metaRef);
    if (snap.exists && snap.data()?.claimedBy) {
      return { ok: false as const };
    }
    tx.set(metaRef, {
      claimedBy: userId,
      claimedAt: FieldValue.serverTimestamp(),
    });
    return { ok: true as const };
  });
}
