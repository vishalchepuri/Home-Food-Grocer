import fs from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_PROJECT_ID ?? "my-app-a7f88";
const serviceAccountPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
  "C:\\Users\\vishal\\Downloads\\Workspace\\Home-Food-Grocer\\Home-Food-Grocer\\.local\\firebase-service-account.json";

initializeApp({
  credential: cert(JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"))),
  projectId,
});

const db = getFirestore();

const images = [
  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800",
  "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=800",
  "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
  "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
];

const menuByCuisine: Record<string, string[]> = {
  "North Indian": ["Paneer Butter Masala", "Dal Makhani", "Butter Naan", "Rajma Chawal"],
  "South Indian": ["Masala Dosa", "Idli Sambar", "Medu Vada", "Filter Coffee"],
  Biryani: ["Chicken Dum Biryani", "Veg Biryani", "Raita Bowl", "Mirchi Ka Salan"],
  Chinese: ["Hakka Noodles", "Fried Rice", "Chilli Paneer", "Manchurian Gravy"],
  Continental: ["Creamy Pasta", "Grilled Sandwich", "Caesar Salad", "Brownie Sundae"],
  Italian: ["Margherita Pizza", "Alfredo Pasta", "Garlic Bread", "Tiramisu"],
  Mexican: ["Paneer Tacos", "Burrito Bowl", "Nachos Supreme", "Quesadilla"],
  Thai: ["Thai Green Curry", "Pad Thai", "Basil Fried Rice", "Tom Yum Soup"],
  Arabian: ["Chicken Shawarma", "Falafel Wrap", "Mandi Rice", "Hummus Platter"],
  Desserts: ["Gulab Jamun", "Chocolate Brownie", "Rasmalai", "Cheesecake Slice"],
  Japanese: ["Veg Sushi Roll", "Ramen Bowl", "Teriyaki Rice", "Miso Soup"],
  Korean: ["Bibimbap Bowl", "Kimchi Fried Rice", "Korean Fried Chicken", "Tteokbokki"],
  Pizza: ["Margherita Pizza", "Farmhouse Pizza", "Paneer Tikka Pizza", "Garlic Breadsticks"],
  Burgers: ["Classic Veg Burger", "Crispy Chicken Burger", "Fries Combo", "Thick Shake"],
  Cafe: ["Cappuccino", "Cold Coffee", "Club Sandwich", "Brownie"],
  Healthy: ["Millet Power Bowl", "Sprout Salad", "Protein Wrap", "Fruit Bowl"],
};

const defaultMenu = ["Chef Special Meal", "Signature Rice Bowl", "House Snack Plate", "Dessert Cup"];

function menuFor(cuisine: string) {
  return menuByCuisine[cuisine] ?? defaultMenu;
}

async function main() {
  const chefs = await db.collection("chefs").get();
  let created = 0;
  let batch = db.batch();
  let batchSize = 0;

  for (const chefDoc of chefs.docs) {
    const chef = chefDoc.data();
    const chefId = Number(chef.id);
    const existing = await db
      .collection("dishes")
      .where("chefId", "==", chefId)
      .limit(1)
      .get();

    if (!existing.empty) continue;

    menuFor(String(chef.cuisine)).forEach((name, index) => {
      const id = chefId * 100 + index + 1;
      const ref = db.collection("dishes").doc(String(id));
      batch.set(ref, {
        id,
        chefId,
        name,
        description: `${name} prepared by ${chef.name} in ${chef.location}.`,
        price: 99 + index * 35,
        imageUrl: images[(chefId + index) % images.length],
        isVeg: Boolean(chef.isVeg) || !/chicken|mutton|fish|prawn|crab/i.test(name),
        rating: Number(chef.rating ?? 4.5),
        spiceLevel: index % 3 === 0 ? "mild" : index % 3 === 1 ? "medium" : "spicy",
        popular: index < 2,
      });
      created += 1;
      batchSize += 1;
    });

    if (batchSize >= 480) {
      await batch.commit();
      batch = db.batch();
      batchSize = 0;
    }
  }

  if (batchSize > 0) {
    await batch.commit();
  }

  console.log(`Created ${created} missing dishes`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
