import {
  db,
  categoriesTable,
  chefsTable,
  dishesTable,
  productsTable,
  offersTable,
} from "@workspace/db";

async function main() {
  console.log("Clearing existing data...");
  await db.delete(dishesTable);
  await db.delete(productsTable);
  await db.delete(chefsTable);
  await db.delete(categoriesTable);
  await db.delete(offersTable);

  console.log("Seeding categories...");
  const categories = await db
    .insert(categoriesTable)
    .values([
      // Home food cuisines
      {
        name: "North Indian",
        slug: "north-indian",
        kind: "home_food",
        imageUrl:
          "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400",
      },
      {
        name: "South Indian",
        slug: "south-indian",
        kind: "home_food",
        imageUrl:
          "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400",
      },
      {
        name: "Bengali",
        slug: "bengali",
        kind: "home_food",
        imageUrl:
          "https://images.unsplash.com/photo-1567337710282-00832b415979?w=400",
      },
      {
        name: "Gujarati Thali",
        slug: "gujarati",
        kind: "home_food",
        imageUrl:
          "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=400",
      },
      {
        name: "Continental",
        slug: "continental",
        kind: "home_food",
        imageUrl:
          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400",
      },
      {
        name: "Healthy Bowls",
        slug: "healthy-bowls",
        kind: "home_food",
        imageUrl:
          "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
      },
      // Grocery categories
      {
        name: "Fruits & Vegetables",
        slug: "fruits-vegetables",
        kind: "grocery",
        imageUrl:
          "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400",
      },
      {
        name: "Dairy & Eggs",
        slug: "dairy-eggs",
        kind: "grocery",
        imageUrl:
          "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
      },
      {
        name: "Bakery",
        slug: "bakery",
        kind: "grocery",
        imageUrl:
          "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
      },
      {
        name: "Snacks",
        slug: "snacks",
        kind: "grocery",
        imageUrl:
          "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400",
      },
      {
        name: "Beverages",
        slug: "beverages",
        kind: "grocery",
        imageUrl:
          "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400",
      },
      {
        name: "Staples",
        slug: "staples",
        kind: "grocery",
        imageUrl:
          "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
      },
    ])
    .returning();

  const catBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));

  console.log("Seeding chefs...");
  const chefs = await db
    .insert(chefsTable)
    .values([
      {
        name: "Anita's Rasoi",
        tagline: "Punjabi comfort food, slow-cooked with love",
        cuisine: "North Indian",
        rating: "4.8",
        etaMinutes: 35,
        deliveryFee: "29",
        imageUrl:
          "https://images.unsplash.com/photo-1574484284002-952d92456975?w=600",
        location: "Indiranagar, Bangalore",
        priceForTwo: "350",
        isVeg: true,
        featured: true,
      },
      {
        name: "Meera's Kitchen",
        tagline: "Authentic South Indian tiffins",
        cuisine: "South Indian",
        rating: "4.7",
        etaMinutes: 30,
        deliveryFee: "25",
        imageUrl:
          "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
        location: "Koramangala, Bangalore",
        priceForTwo: "280",
        isVeg: true,
        featured: true,
      },
      {
        name: "Bong Bhog",
        tagline: "Bengali home meals just like maa makes",
        cuisine: "Bengali",
        rating: "4.9",
        etaMinutes: 45,
        deliveryFee: "35",
        imageUrl:
          "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600",
        location: "HSR Layout, Bangalore",
        priceForTwo: "420",
        isVeg: false,
        featured: true,
      },
      {
        name: "The Gujarati Pot",
        tagline: "Hand-rolled rotlis and seasonal sabzi",
        cuisine: "Gujarati",
        rating: "4.6",
        etaMinutes: 40,
        deliveryFee: "29",
        imageUrl:
          "https://images.unsplash.com/photo-1567337710282-00832b415979?w=600",
        location: "Whitefield, Bangalore",
        priceForTwo: "320",
        isVeg: true,
        featured: true,
      },
      {
        name: "Café Olivia",
        tagline: "Healthy continental from a home studio",
        cuisine: "Continental",
        rating: "4.5",
        etaMinutes: 35,
        deliveryFee: "39",
        imageUrl:
          "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600",
        location: "Domlur, Bangalore",
        priceForTwo: "480",
        isVeg: false,
        featured: false,
      },
      {
        name: "Green Bowl Co.",
        tagline: "Macro-balanced bowls and salads",
        cuisine: "Healthy",
        rating: "4.4",
        etaMinutes: 25,
        deliveryFee: "29",
        imageUrl:
          "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=600",
        location: "Jayanagar, Bangalore",
        priceForTwo: "390",
        isVeg: true,
        featured: false,
      },
    ])
    .returning();

  console.log("Seeding dishes...");
  await db.insert(dishesTable).values([
    // Anita's Rasoi
    {
      chefId: chefs[0].id,
      name: "Dal Makhani with Jeera Rice",
      description: "Black lentils slow-cooked overnight, served with jeera rice and raita",
      price: "189",
      imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500",
      isVeg: true,
      rating: "4.8",
      spiceLevel: "medium",
      popular: true,
    },
    {
      chefId: chefs[0].id,
      name: "Punjabi Rajma Chawal",
      description: "Kidney beans in a tomato-onion gravy with steamed basmati",
      price: "169",
      imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500",
      isVeg: true,
      rating: "4.7",
      spiceLevel: "medium",
      popular: true,
    },
    {
      chefId: chefs[0].id,
      name: "Aloo Paratha (2 pcs) with Curd",
      description: "Stuffed wheat flatbreads, white butter and homemade curd",
      price: "149",
      imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500",
      isVeg: true,
      rating: "4.6",
      spiceLevel: "mild",
      popular: false,
    },
    // Meera's Kitchen
    {
      chefId: chefs[1].id,
      name: "Mini Idli Sambar Bowl",
      description: "12 button idlis swimming in lentil sambar with coconut chutney",
      price: "139",
      imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500",
      isVeg: true,
      rating: "4.9",
      spiceLevel: "mild",
      popular: true,
    },
    {
      chefId: chefs[1].id,
      name: "Ghee Roast Masala Dosa",
      description: "Crisp ghee dosa with potato masala, sambar and three chutneys",
      price: "159",
      imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=500",
      isVeg: true,
      rating: "4.8",
      spiceLevel: "medium",
      popular: true,
    },
    {
      chefId: chefs[1].id,
      name: "Curd Rice with Pickle",
      description: "Comforting tempered curd rice with mango pickle",
      price: "119",
      imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500",
      isVeg: true,
      rating: "4.5",
      spiceLevel: "mild",
      popular: false,
    },
    // Bong Bhog
    {
      chefId: chefs[2].id,
      name: "Kosha Mangsho with Luchi",
      description: "Slow-cooked Bengali mutton curry with fluffy luchis",
      price: "289",
      imageUrl: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=500",
      isVeg: false,
      rating: "4.9",
      spiceLevel: "spicy",
      popular: true,
    },
    {
      chefId: chefs[2].id,
      name: "Macher Jhol with Bhaat",
      description: "Light fish curry with potato and steamed Gobindobhog rice",
      price: "239",
      imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500",
      isVeg: false,
      rating: "4.8",
      spiceLevel: "medium",
      popular: false,
    },
    {
      chefId: chefs[2].id,
      name: "Shukto with Rice",
      description: "Mildly bitter Bengali vegetable medley, served with steamed rice",
      price: "189",
      imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500",
      isVeg: true,
      rating: "4.6",
      spiceLevel: "mild",
      popular: false,
    },
    // The Gujarati Pot
    {
      chefId: chefs[3].id,
      name: "Mini Gujarati Thali",
      description: "Two sabzi, dal, kadhi, rotli, rice, papad and a sweet",
      price: "229",
      imageUrl: "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=500",
      isVeg: true,
      rating: "4.7",
      spiceLevel: "mild",
      popular: true,
    },
    {
      chefId: chefs[3].id,
      name: "Khaman Dhokla Plate",
      description: "Steamed gram-flour cake with green chutney and tempering",
      price: "129",
      imageUrl: "https://images.unsplash.com/photo-1567337710282-00832b415979?w=500",
      isVeg: true,
      rating: "4.6",
      spiceLevel: "mild",
      popular: false,
    },
    // Café Olivia
    {
      chefId: chefs[4].id,
      name: "Pesto Penne with Garlic Bread",
      description: "Fresh basil pesto, parmesan and toasted garlic bread",
      price: "249",
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
      isVeg: true,
      rating: "4.5",
      spiceLevel: "mild",
      popular: true,
    },
    {
      chefId: chefs[4].id,
      name: "Grilled Chicken with Mash",
      description: "Herb-grilled chicken breast, garlic mash and seasonal greens",
      price: "319",
      imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500",
      isVeg: false,
      rating: "4.6",
      spiceLevel: "mild",
      popular: false,
    },
    // Green Bowl Co.
    {
      chefId: chefs[5].id,
      name: "Quinoa Rainbow Bowl",
      description: "Quinoa, roasted veggies, hummus and tahini dressing",
      price: "229",
      imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500",
      isVeg: true,
      rating: "4.5",
      spiceLevel: "mild",
      popular: true,
    },
    {
      chefId: chefs[5].id,
      name: "Greek Salad with Feta",
      description: "Crisp cucumber, olives, tomato and feta in olive-oil dressing",
      price: "189",
      imageUrl: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=500",
      isVeg: true,
      rating: "4.4",
      spiceLevel: "mild",
      popular: false,
    },
  ]);

  console.log("Seeding products...");
  await db.insert(productsTable).values([
    // Fruits & Vegetables
    {
      name: "Bananas (1 dozen)",
      description: "Naturally ripened robusta bananas",
      price: "55",
      mrp: "70",
      unit: "12 pcs",
      imageUrl:
        "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
      categoryId: catBySlug["fruits-vegetables"].id,
      essential: true,
    },
    {
      name: "Roma Tomatoes",
      description: "Farm-fresh tomatoes for everyday cooking",
      price: "45",
      mrp: "60",
      unit: "1 kg",
      imageUrl:
        "https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=400",
      categoryId: catBySlug["fruits-vegetables"].id,
      essential: true,
    },
    {
      name: "Baby Spinach",
      description: "Tender baby spinach leaves, washed and ready",
      price: "39",
      mrp: "49",
      unit: "200 g",
      imageUrl:
        "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400",
      categoryId: catBySlug["fruits-vegetables"].id,
      essential: false,
    },
    {
      name: "Alphonso Mango Pack",
      description: "Premium hand-picked Ratnagiri Alphonso mangoes",
      price: "499",
      mrp: "599",
      unit: "6 pcs",
      imageUrl:
        "https://images.unsplash.com/photo-1605027990121-cbae9e0642db?w=400",
      categoryId: catBySlug["fruits-vegetables"].id,
      essential: false,
    },
    // Dairy & Eggs
    {
      name: "Farm Fresh Milk (Full Cream)",
      description: "Pasteurised, homogenised cow milk",
      price: "62",
      mrp: "65",
      unit: "1 L",
      imageUrl:
        "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400",
      categoryId: catBySlug["dairy-eggs"].id,
      essential: true,
    },
    {
      name: "Brown Eggs",
      description: "Cage-free brown eggs from Karnataka farms",
      price: "98",
      mrp: "120",
      unit: "12 pcs",
      imageUrl:
        "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400",
      categoryId: catBySlug["dairy-eggs"].id,
      essential: true,
    },
    {
      name: "Greek Yogurt",
      description: "Thick, creamy and protein-rich Greek yogurt",
      price: "129",
      mrp: "149",
      unit: "400 g",
      imageUrl:
        "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
      categoryId: catBySlug["dairy-eggs"].id,
      essential: false,
    },
    {
      name: "Salted Butter Block",
      description: "Creamy salted butter, perfect for breakfast",
      price: "265",
      mrp: "295",
      unit: "500 g",
      imageUrl:
        "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400",
      categoryId: catBySlug["dairy-eggs"].id,
      essential: false,
    },
    // Bakery
    {
      name: "Sourdough Loaf",
      description: "Slow-fermented artisan sourdough, baked daily",
      price: "199",
      mrp: "229",
      unit: "500 g",
      imageUrl:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
      categoryId: catBySlug["bakery"].id,
      essential: false,
    },
    {
      name: "Wholewheat Sandwich Bread",
      description: "100% whole wheat, no maida",
      price: "65",
      mrp: "75",
      unit: "400 g",
      imageUrl:
        "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=400",
      categoryId: catBySlug["bakery"].id,
      essential: true,
    },
    // Snacks
    {
      name: "Roasted Almonds",
      description: "California almonds, lightly salted",
      price: "349",
      mrp: "399",
      unit: "250 g",
      imageUrl:
        "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400",
      categoryId: catBySlug["snacks"].id,
      essential: false,
    },
    {
      name: "Masala Banana Chips",
      description: "Crispy Kerala-style banana chips with spices",
      price: "89",
      mrp: "110",
      unit: "200 g",
      imageUrl:
        "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400",
      categoryId: catBySlug["snacks"].id,
      essential: false,
    },
    // Beverages
    {
      name: "Cold Pressed Orange Juice",
      description: "100% orange, no added sugar or preservatives",
      price: "149",
      mrp: "175",
      unit: "1 L",
      imageUrl:
        "https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400",
      categoryId: catBySlug["beverages"].id,
      essential: false,
    },
    {
      name: "Single Origin Coffee Beans",
      description: "Medium-roast Arabica from Coorg",
      price: "499",
      mrp: "599",
      unit: "250 g",
      imageUrl:
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400",
      categoryId: catBySlug["beverages"].id,
      essential: false,
    },
    // Staples
    {
      name: "Sona Masuri Rice",
      description: "Premium Sona Masuri raw rice",
      price: "459",
      mrp: "499",
      unit: "5 kg",
      imageUrl:
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400",
      categoryId: catBySlug["staples"].id,
      essential: true,
    },
    {
      name: "Toor Dal",
      description: "Unpolished toor dal, sourced from Maharashtra",
      price: "189",
      mrp: "210",
      unit: "1 kg",
      imageUrl:
        "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400",
      categoryId: catBySlug["staples"].id,
      essential: true,
    },
    {
      name: "Cold-Pressed Groundnut Oil",
      description: "Wood-pressed groundnut oil from a small mill",
      price: "299",
      mrp: "349",
      unit: "1 L",
      imageUrl:
        "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=400",
      categoryId: catBySlug["staples"].id,
      essential: false,
    },
  ]);

  console.log("Seeding offers...");
  await db.insert(offersTable).values([
    {
      title: "50% off your first order",
      subtitle: "Use code WELCOME50 — up to ₹100 off",
      code: "WELCOME50",
      accentColor: "#ff5a1f",
    },
    {
      title: "Free delivery above ₹299",
      subtitle: "Save on delivery on bigger orders",
      code: "FREESHIP",
      accentColor: "#16a34a",
    },
    {
      title: "Flat ₹75 off on home meals",
      subtitle: "On orders above ₹399 from home chefs",
      code: "HOMECHEF75",
      accentColor: "#7c3aed",
    },
  ]);

  console.log("Seed complete.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
