import fs from "node:fs";
import { randomUUID } from "node:crypto";
import { cert, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

type Kind = "home_food" | "grocery";

const projectId = process.env.FIREBASE_PROJECT_ID ?? "my-app-a7f88";
const storageBucket =
  process.env.FIREBASE_STORAGE_BUCKET ?? "my-app-a7f88.firebasestorage.app";
const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
  "C:\\Users\\vishal\\Downloads\\Workspace\\Home-Food-Grocer\\Home-Food-Grocer\\.local\\firebase-service-account.json";

if (!fs.existsSync(serviceAccountPath)) {
  throw new Error(`Missing Firebase service account JSON: ${serviceAccountPath}`);
}

initializeApp({
  credential: cert(JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"))),
  projectId,
  storageBucket,
});

const db = getFirestore();
const bucket = getStorage().bucket();

const categories = [
  { id: 1, name: "North Indian", slug: "north-indian", kind: "home_food" as Kind, imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600" },
  { id: 2, name: "South Indian", slug: "south-indian", kind: "home_food" as Kind, imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600" },
  { id: 3, name: "Fruits & Vegetables", slug: "fruits-vegetables", kind: "grocery" as Kind, imageUrl: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600" },
  { id: 4, name: "Dairy & Bread", slug: "dairy-bread", kind: "grocery" as Kind, imageUrl: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600" },
];

const hyderabadRestaurants = [
  "Paradise Biryani", "Bawarchi RTC X Roads", "Shah Ghouse Cafe", "Cafe Bahar",
  "Pista House", "Hotel Shadab", "Chutneys", "Minerva Coffee Shop",
  "Rayalaseema Ruchulu", "Kritunga Restaurant",
];

const warangalRestaurants = [
  "Hotel Ashoka", "Kakatiya Deluxe Mess", "Haritha Kakatiya Restaurant",
  "Om Sairam Tiffins and Meals", "Hotel Amaravathi", "Madhuram Tiffins and Meals",
  "KingsWay Restaurant and Bar", "Balaji Santosh Dhaba", "Haveli Restaurant",
  "Green Park Restaurant",
];

const cities = ["Hyderabad", "Warangal", "Bangalore", "Chennai", "Mumbai", "Delhi", "Kolkata", "Goa"];
const cuisines = ["North Indian", "South Indian", "Punjabi", "Mughlai", "Bengali", "Healthy", "Chinese", "Coastal", "Gujarati", "Bakery"];
const chefImages = [
  "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800",
  "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800",
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=800",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
  "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
  "https://images.unsplash.com/photo-1543353071-10c8ba85a904?w=800",
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
];
const dishNames = ["Paneer Butter Masala Combo", "Masala Dosa Breakfast", "Amritsari Kulcha Platter", "Dum Biryani Bowl", "Kosha Curry Meal", "Millet Veg Power Bowl", "Hakka Noodles Box", "Fish Curry Rice", "Mini Gujarati Thali", "Fresh Bun Maska Combo"];

function namesForCity(city: string) {
  if (city === "Hyderabad") return hyderabadRestaurants;
  if (city === "Warangal") return warangalRestaurants;
  return cuisines.map((_, i) => `${city} ${["Spice Kitchen", "Tiffin House", "Biryani Darbar", "Family Restaurant", "Veg Meals", "Coastal Curry", "Dhaba", "Home Foods", "Bakery Cafe", "Thali House"][i]}`);
}

const chefs = cities.flatMap((city, cityIndex) =>
  namesForCity(city).map((name, index) => ({
    id: cityIndex * 10 + index + 1,
    name,
    tagline: `Top-rated ${cuisines[index].toLowerCase()} meals freshly cooked in ${city}.`,
    cuisine: cuisines[index],
    rating: Number((4.9 - (index % 5) * 0.1).toFixed(1)),
    etaMinutes: 20 + ((cityIndex + index) % 18),
    deliveryFee: 15 + ((cityIndex + index) % 4) * 10,
    imageUrl: chefImages[index],
    location: city,
    priceForTwo: 220 + index * 35,
    isVeg: !["Mughlai", "Bengali", "Chinese", "Coastal"].includes(cuisines[index]),
    featured: index < 4,
  })),
);

const dishes = chefs.map((chef, index) => ({
  id: chef.id,
  chefId: chef.id,
  name: dishNames[index % dishNames.length],
  description: `Signature ${chef.cuisine.toLowerCase()} favorite from ${chef.location}.`,
  price: 119 + (index % 10) * 18,
  imageUrl: chefImages[index % chefImages.length],
  isVeg: chef.isVeg,
  rating: chef.rating,
  spiceLevel: index % 3 === 0 ? "mild" : index % 3 === 1 ? "medium" : "spicy",
  popular: index % 10 < 6,
}));

const products = [
  ["Bananas", "Fresh Robusta bananas.", 54, 65, "1 dozen", "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=600", 3],
  ["Apples", "Crisp red apples.", 149, 179, "1 kg", "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600", 3],
  ["Tomatoes", "Ripe hybrid tomatoes.", 36, 48, "1 kg", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600", 3],
  ["Onions", "Everyday red onions.", 42, 55, "1 kg", "https://images.unsplash.com/photo-1508747703725-719777637510?w=600", 3],
  ["Potatoes", "Fresh table potatoes.", 38, 50, "1 kg", "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600", 3],
  ["Milk", "Fresh toned milk pouch.", 32, 34, "500 ml", "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600", 4],
  ["Curd", "Thick set curd.", 45, 50, "400 g", "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600", 4],
  ["Paneer", "Soft malai paneer.", 95, 110, "200 g", "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600", 4],
  ["White Bread", "Fresh sandwich bread.", 45, 50, "400 g", "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600", 4],
  ["Eggs", "Farm fresh eggs.", 72, 84, "6 pcs", "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600", 4],
].map(([name, description, price, mrp, unit, imageUrl, categoryId], index) => ({
  id: index + 1,
  name,
  description,
  price,
  mrp,
  unit,
  imageUrl,
  categoryId,
  inStock: true,
  essential: index < 8,
}));

const offers = [
  { id: 1, title: "50% off your first order", subtitle: "Use WELCOME50", code: "WELCOME50", accentColor: "#f97316" },
  { id: 2, title: "Free delivery", subtitle: "On grocery orders over Rs 299", code: "FREESHIP", accentColor: "#16a34a" },
];

async function uploadImage(url: string, folder: string, id: number) {
  if (process.env.UPLOAD_FIREBASE_IMAGES === "false") return url;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`Image fetch failed: ${url}`);

  const contentType = response.headers.get("content-type") ?? "image/jpeg";
  const token = randomUUID();
  const path = `${folder}/${id}.jpg`;
  await bucket.file(path).save(Buffer.from(await response.arrayBuffer()), {
    metadata: { contentType, metadata: { firebaseStorageDownloadTokens: token } },
  });

  return `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

async function clearCollection(name: string) {
  const snapshot = await db.collection(name).get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
}

async function writeCollection(name: string, rows: Array<Record<string, unknown>>) {
  const batch = db.batch();
  rows.forEach((row) => batch.set(db.collection(name).doc(String(row.id)), row));
  await batch.commit();
}

async function main() {
  console.log(`Seeding Firebase project ${projectId}`);
  await Promise.all(["categories", "chefs", "dishes", "products", "offers"].map(clearCollection));

  const categoriesWithStorage = await Promise.all(categories.map(async (item) => ({
    ...item,
    imageUrl: await uploadImage(item.imageUrl, "categories", item.id),
  })));
  const chefsWithStorage = await Promise.all(chefs.map(async (item) => ({
    ...item,
    imageUrl: await uploadImage(item.imageUrl, "chefs", item.id),
  })));
  const dishesWithStorage = await Promise.all(dishes.map(async (item) => ({
    ...item,
    imageUrl: await uploadImage(item.imageUrl, "dishes", item.id),
  })));
  const productsWithStorage = await Promise.all(products.map(async (item) => ({
    ...item,
    imageUrl: await uploadImage(String(item.imageUrl), "products", Number(item.id)),
  })));

  await writeCollection("categories", categoriesWithStorage);
  await writeCollection("chefs", chefsWithStorage);
  await writeCollection("dishes", dishesWithStorage);
  await writeCollection("products", productsWithStorage);
  await writeCollection("offers", offers);
  await db.collection("meta").doc("seed").set({
    seededAt: FieldValue.serverTimestamp(),
    categories: categories.length,
    chefs: chefs.length,
    dishes: dishes.length,
    products: products.length,
    offers: offers.length,
  });

  console.log("Firebase seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
