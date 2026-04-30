import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";

const projectId = process.env.FIREBASE_PROJECT_ID ?? "my-app-a7f88";
const storageBucket =
  process.env.FIREBASE_STORAGE_BUCKET ?? "my-app-a7f88.firebasestorage.app";

type Row = Record<string, unknown> & { id: number; imageUrl?: string };

const tokenPath = path.join(
  os.homedir(),
  ".config",
  "configstore",
  "firebase-tools.json",
);

function getAccessToken() {
  if (process.env.FIREBASE_ACCESS_TOKEN) {
    return process.env.FIREBASE_ACCESS_TOKEN;
  }

  if (fs.existsSync(tokenPath)) {
    const raw = JSON.parse(fs.readFileSync(tokenPath, "utf8")) as {
      tokens?: { access_token?: string; expires_at?: number };
    };
    const token = raw.tokens?.access_token;
    if (token && (!raw.tokens?.expires_at || raw.tokens.expires_at > Date.now())) {
      return token;
    }
  }

  const token = execFileSync("gcloud", ["auth", "print-access-token"], {
    encoding: "utf8",
  }).trim();
  if (!token) {
    throw new Error("No Firebase CLI or gcloud access token found.");
  }
  return token;
}

const token = getAccessToken();

const categories: Row[] = [
  { id: 1, name: "North Indian", slug: "north-indian", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600" },
  { id: 2, name: "South Indian", slug: "south-indian", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600" },
  { id: 3, name: "Biryani", slug: "biryani", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=600&q=80" },
  { id: 4, name: "Chinese", slug: "chinese", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600" },
  { id: 5, name: "Continental", slug: "continental", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600" },
  { id: 6, name: "Italian", slug: "italian", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600" },
  { id: 7, name: "Mexican", slug: "mexican", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600" },
  { id: 8, name: "Thai", slug: "thai", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600" },
  { id: 9, name: "Arabian", slug: "arabian", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600" },
  { id: 10, name: "Desserts", slug: "desserts", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600" },
  { id: 11, name: "Japanese", slug: "japanese", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600" },
  { id: 12, name: "Korean", slug: "korean", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600" },
  { id: 13, name: "Fast Food", slug: "fast-food", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600" },
  { id: 14, name: "Street Food", slug: "street-food", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80" },
  { id: 15, name: "Pizza", slug: "pizza", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600" },
  { id: 16, name: "Burgers", slug: "burgers", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600" },
  { id: 17, name: "Cafe", slug: "cafe", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600" },
  { id: 18, name: "Andhra", slug: "andhra", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600" },
  { id: 19, name: "Kerala", slug: "kerala", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600" },
  { id: 20, name: "Rajasthani", slug: "rajasthani", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600" },
  { id: 21, name: "Mediterranean", slug: "mediterranean", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600" },
  { id: 22, name: "Lebanese", slug: "lebanese", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600" },
  { id: 23, name: "Turkish", slug: "turkish", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1576866209830-589e1bfbaa4d?w=600" },
  { id: 24, name: "Vietnamese", slug: "vietnamese", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600" },
  { id: 25, name: "Momos", slug: "momos", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=600" },
  { id: 26, name: "Rolls & Wraps", slug: "rolls-wraps", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600" },
  { id: 27, name: "BBQ & Grill", slug: "bbq-grill", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600" },
  { id: 28, name: "Breakfast", slug: "breakfast", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600" },
  { id: 29, name: "Salads", slug: "salads", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600" },
  { id: 30, name: "Juices & Shakes", slug: "juices-shakes", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600" },
  { id: 31, name: "Ice Cream", slug: "ice-cream", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600" },
  { id: 32, name: "North East", slug: "north-east", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600" },
  { id: 33, name: "Odia", slug: "odia", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600" },
  { id: 34, name: "Hyderabadi", slug: "hyderabadi", kind: "home_food", imageUrl: "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=600&q=80" },
  { id: 35, name: "Fruits & Vegetables", slug: "fruits-vegetables", kind: "grocery", imageUrl: "https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600" },
  { id: 36, name: "Dairy & Bread", slug: "dairy-bread", kind: "grocery", imageUrl: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600" },
  { id: 37, name: "Rice, Atta & Dal", slug: "rice-atta-dal", kind: "grocery", imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600" },
  { id: 38, name: "Masala & Spices", slug: "masala-spices", kind: "grocery", imageUrl: "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=600" },
  { id: 39, name: "Snacks & Namkeen", slug: "snacks-namkeen", kind: "grocery", imageUrl: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600" },
  { id: 40, name: "Beverages", slug: "beverages", kind: "grocery", imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600" },
  { id: 41, name: "Personal Care", slug: "personal-care", kind: "grocery", imageUrl: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600" },
  { id: 42, name: "Home Cleaning", slug: "home-cleaning", kind: "grocery", imageUrl: "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=600" },
  { id: 43, name: "Baby Care", slug: "baby-care", kind: "grocery", imageUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600" },
  { id: 44, name: "Frozen Foods", slug: "frozen-foods", kind: "grocery", imageUrl: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600" },
];

const restaurants = {
  Hyderabad: [
    "Paradise Biryani", "Bawarchi RTC X Roads", "Shah Ghouse Cafe", "Cafe Bahar",
    "Pista House", "Hotel Shadab", "Chutneys", "Minerva Coffee Shop",
    "Rayalaseema Ruchulu", "Kritunga Restaurant",
  ],
  Warangal: [
    "Hotel Ashoka", "Kakatiya Deluxe Mess", "Haritha Kakatiya Restaurant",
    "Om Sairam Tiffins and Meals", "Hotel Amaravathi", "Madhuram Tiffins and Meals",
    "KingsWay Restaurant and Bar", "Balaji Santosh Dhaba", "Haveli Restaurant",
    "Green Park Restaurant", "Fort View Italian Kitchen", "Kakatiya Pizza Works",
    "Hanamkonda Chinese Bowl", "Warangal Shawarma House", "Urban Tacos Warangal",
    "Cafe Thousand Pillars", "Spice Route Warangal", "Healthy Bowl Co Warangal",
  ],
  Bangalore: [
    "Indiranagar Pasta Bar", "Koramangala Burger House", "Malleshwaram Tiffins",
    "Jayanagar Andhra Meals", "Whitefield Thai Kitchen", "MG Road Sushi Counter",
    "HSR Mexican Grill", "Basavanagudi Chaat House", "Bangalore Biryani Co",
    "Lavelle Road Cafe", "Korean Bowl Bangalore", "Rajajinagar North Meals",
  ],
  Chennai: [
    "T Nagar Dosa House", "Mylapore Filter Coffee", "Adyar Italian Table",
    "Besant Nagar Seafood Kitchen", "Anna Nagar Burger Joint", "Velachery Thai Bowl",
    "Nungambakkam Pizza Studio", "Chennai Chettinad Meals", "Marina Chaat Cart",
    "OMR Healthy Kitchen", "Korean House Chennai", "Arabian Nights Chennai",
  ],
  Mumbai: [
    "Bandra Pasta Project", "Andheri Burger Lab", "Dadar Maharashtrian Meals",
    "Colaba Coastal Kitchen", "Powai Thai Express", "Juhu Pizza Studio",
    "Lower Parel Sushi Bar", "Mumbai Chaat Company", "Malad Biryani House",
    "Worli Cafe Club", "Korean Grill Mumbai", "Borivali Gujarati Thali",
  ],
  Delhi: [
    "Connaught Place Chole House", "Karol Bagh Punjabi Rasoi", "Saket Italian Kitchen",
    "Hauz Khas Sushi Room", "Dwarka Burger Co", "Lajpat Nagar Momos",
    "Delhi Biryani Darbar", "Green Park Thai Bowl", "Rajouri Mexican Grill",
    "Chandni Chowk Chaat", "Nehru Place Cafe", "Rajasthani Rasoi Delhi",
  ],
  Kolkata: [
    "Park Street Continental", "Salt Lake Bengali Kitchen", "Kolkata Roll House",
    "New Market Biryani", "Howrah Chinese Bowl", "Ballygunge Cafe",
    "Korean Bowl Kolkata", "Mediterranean Table Kolkata", "Momos Central Kolkata",
    "Odia Thali Kolkata", "Ice Cream Works Kolkata", "Healthy Salad Kolkata",
  ],
  Pune: [
    "Koregaon Park Italian", "Viman Nagar Burger Co", "Pune Misal House",
    "Baner Thai Kitchen", "Kothrud Breakfast Club", "Hinjewadi BBQ Grill",
    "Aundh Mediterranean Bowl", "Pune Momos Studio", "Cafe Deccan",
    "Lebanese Wraps Pune", "Juice Junction Pune", "Hyderabadi Biryani Pune",
  ],
  Ahmedabad: [
    "CG Road Gujarati Thali", "Manek Chowk Street Food", "Ahmedabad Pizza Oven",
    "Navrangpura Cafe", "Satellite Mexican Bowl", "Lebanese Grill Ahmedabad",
    "Korean Rice Bowl Ahmedabad", "Momos Hub Ahmedabad", "Healthy Salad Bar",
    "Ice Cream Studio Ahmedabad", "Breakfast House Ahmedabad", "Mediterranean Ahmedabad",
  ],
};

const allCities = [
  "Hyderabad",
  "Warangal",
  "Karimnagar",
  "Rajanna Sircilla",
  "Nizamabad",
  "Khammam",
  "Bangalore",
  "Mysore",
  "Mangalore",
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Pondicherry",
  "Kochi",
  "Thiruvananthapuram",
  "Mumbai",
  "Pune",
  "Nagpur",
  "Delhi",
  "Gurgaon",
  "Noida",
  "Kolkata",
  "Ahmedabad",
  "Surat",
  "Jaipur",
  "Lucknow",
  "Chandigarh",
  "Bhubaneswar",
  "Visakhapatnam",
  "Vijayawada",
  "Goa",
];

const cuisines = ["North Indian", "South Indian", "Biryani", "Chinese", "Continental", "Italian", "Mexican", "Thai", "Arabian", "Desserts", "Japanese", "Korean", "Fast Food", "Street Food", "Pizza", "Burgers", "Cafe", "Andhra", "Kerala", "Rajasthani", "Mediterranean", "Lebanese", "Turkish", "Vietnamese", "Momos", "Rolls & Wraps", "BBQ & Grill", "Breakfast", "Salads", "Juices & Shakes", "Ice Cream", "North East", "Odia", "Hyderabadi", "Punjabi", "Mughlai", "Bengali", "Healthy", "Coastal", "Gujarati", "Bakery"];
const images = [
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
const fallbackImage = images[0];
const menuByCuisine: Record<string, string[]> = {
  "North Indian": ["Paneer Butter Masala", "Dal Makhani", "Butter Naan", "Rajma Chawal", "Aloo Paratha", "Kadai Paneer", "Malai Kofta", "Jeera Rice", "Tandoori Roti", "Gajar Halwa"],
  "South Indian": ["Masala Dosa", "Idli Sambar", "Medu Vada", "Pesarattu", "Curd Rice", "Onion Uttapam", "Ghee Pongal", "Lemon Rice", "Rava Dosa", "Filter Coffee"],
  Biryani: ["Chicken Dum Biryani", "Veg Biryani", "Mutton Biryani", "Egg Biryani", "Double Ka Meetha", "Paneer Biryani", "Chicken 65 Biryani", "Ulavacharu Biryani", "Raita Bowl", "Mirchi Ka Salan"],
  Chinese: ["Veg Hakka Noodles", "Chicken Fried Rice", "Chilli Paneer", "Manchurian Gravy", "Schezwan Momos", "Dragon Chicken", "Spring Rolls", "Burnt Garlic Rice", "Hot and Sour Soup", "Honey Chilli Potato"],
  Continental: ["Grilled Sandwich", "Herb Rice Bowl", "Chicken Steak", "Creamy Pasta", "Caesar Salad", "Veg Au Gratin", "Roasted Veg Bowl", "Peri Peri Fries", "Mushroom Soup", "Brownie Sundae"],
  Italian: ["Margherita Pizza", "Penne Arrabbiata", "Alfredo Pasta", "Garlic Bread", "Tiramisu Cup", "Pesto Pasta", "Lasagna", "Bruschetta", "Minestrone Soup", "Four Cheese Pizza"],
  Mexican: ["Paneer Tacos", "Chicken Burrito", "Nachos Supreme", "Mexican Rice Bowl", "Quesadilla", "Bean Tacos", "Salsa Corn Cups", "Loaded Burrito Bowl", "Guacamole Toast", "Churros"],
  Thai: ["Thai Green Curry", "Pad Thai", "Basil Fried Rice", "Tom Yum Soup", "Mango Sticky Rice", "Red Curry Rice", "Thai Satay", "Papaya Salad", "Coconut Soup", "Chilli Basil Noodles"],
  Arabian: ["Chicken Shawarma", "Falafel Wrap", "Mandi Rice", "Hummus Platter", "Grilled Kebab", "Paneer Shawarma", "Chicken Kapsa", "Pita Pocket", "Garlic Toum Fries", "Baklava"],
  Desserts: ["Gulab Jamun", "Chocolate Brownie", "Rasmalai", "Cheesecake Slice", "Fruit Custard", "Mango Mousse", "Kulfi Falooda", "Chocolate Truffle", "Waffle Bites", "Caramel Pudding"],
  Japanese: ["Veg Sushi Roll", "Chicken Katsu Curry", "Ramen Bowl", "Teriyaki Rice", "Miso Soup", "Tempura Veg", "Yakitori Skewers", "California Roll", "Edamame", "Matcha Cheesecake"],
  Korean: ["Bibimbap Bowl", "Kimchi Fried Rice", "Korean Fried Chicken", "Tteokbokki", "Japchae Noodles", "Bulgogi Rice Bowl", "Kimchi Pancake", "Gochujang Paneer", "Kimbap Roll", "Honey Butter Fries"],
  "Fast Food": ["Veg Burger", "Chicken Burger", "French Fries", "Cheese Sandwich", "Loaded Nuggets", "Peri Peri Wrap", "Crispy Paneer Burger", "Potato Wedges", "Cold Coffee", "Choco Shake"],
  "Street Food": ["Pani Puri", "Bhel Puri", "Samosa Chaat", "Pav Bhaji", "Vada Pav", "Dahi Puri", "Aloo Tikki", "Kathi Roll", "Mirchi Bajji", "Jalebi"],
  Pizza: ["Margherita Pizza", "Farmhouse Pizza", "Paneer Tikka Pizza", "Chicken Pepperoni Pizza", "Corn Cheese Pizza", "Veggie Supreme", "Cheese Burst Pizza", "Garlic Breadsticks", "Stuffed Garlic Bread", "Choco Lava Cake"],
  Burgers: ["Classic Veg Burger", "Crispy Chicken Burger", "Aloo Tikki Burger", "Paneer Makhani Burger", "Double Cheese Burger", "Peri Peri Burger", "Mushroom Melt Burger", "Fries Combo", "Onion Rings", "Thick Shake"],
  Cafe: ["Cappuccino", "Cold Coffee", "Veg Club Sandwich", "Paneer Panini", "Chicken Panini", "Masala Fries", "Muffin", "Brownie", "Iced Tea", "Cheese Toast"],
  Andhra: ["Andhra Meals", "Gongura Chicken", "Pappu Rice", "Kodi Vepudu", "Avakaya Rice", "Royyala Fry", "Ragi Sangati", "Pulihora", "Mirapakaya Bajji", "Pootharekulu"],
  Kerala: ["Appam Stew", "Malabar Parotta", "Kerala Fish Curry", "Puttu Kadala", "Veg Kurma", "Chicken Roast", "Avial", "Lemon Pickle Rice", "Banana Chips", "Payasam"],
  Rajasthani: ["Dal Baati Churma", "Gatte Ki Sabzi", "Ker Sangri", "Pyaaz Kachori", "Laal Maas", "Bajra Roti", "Rajasthani Thali", "Mirchi Vada", "Mawa Kachori", "Rabri"],
  Mediterranean: ["Falafel Bowl", "Greek Salad", "Pita Hummus Plate", "Grilled Halloumi", "Shawarma Rice Bowl", "Tabbouleh", "Baba Ganoush", "Herbed Couscous", "Chicken Souvlaki", "Baklava Cup"],
  Lebanese: ["Falafel Wrap", "Chicken Shawarma Plate", "Hummus with Pita", "Fattoush Salad", "Moutabal", "Garlic Chicken Skewer", "Labneh Bowl", "Manakish", "Lentil Soup", "Kunafa"],
  Turkish: ["Doner Kebab Wrap", "Turkish Pide", "Adana Kebab", "Mercimek Soup", "Borek", "Chicken Shish", "Lahmacun", "Rice Pilaf", "Cacik Bowl", "Baklava"],
  Vietnamese: ["Veg Pho", "Chicken Pho", "Banh Mi", "Rice Paper Rolls", "Lemongrass Rice Bowl", "Vietnamese Iced Coffee", "Tofu Noodle Salad", "Chicken Spring Rolls", "Bun Cha Bowl", "Mango Tapioca"],
  Momos: ["Veg Steamed Momos", "Chicken Steamed Momos", "Paneer Momos", "Fried Momos", "Tandoori Momos", "Kurkure Momos", "Momos Platter", "Momo Soup", "Chilli Momos", "Chocolate Momos"],
  "Rolls & Wraps": ["Paneer Kathi Roll", "Chicken Kathi Roll", "Egg Roll", "Veg Frankie", "Soya Chaap Roll", "Double Egg Chicken Roll", "Aloo Tikki Wrap", "Shawarma Wrap", "Mexican Wrap", "Cheese Corn Roll"],
  "BBQ & Grill": ["BBQ Chicken Wings", "Grilled Paneer Skewers", "Tandoori Mushroom", "Peri Peri Chicken", "Smoked Veg Platter", "Grilled Fish", "Barbecue Corn", "Chicken Seekh Platter", "Grilled Pineapple", "BBQ Fries"],
  Breakfast: ["Poha", "Upma", "Idli Vada Combo", "Aloo Paratha Curd", "Omelette Toast", "Pancake Stack", "English Breakfast Plate", "Sprouts Poha", "Poori Bhaji", "Masala Tea"],
  Salads: ["Greek Salad", "Caesar Salad", "Sprout Chaat Salad", "Quinoa Salad", "Chicken Protein Salad", "Fruit Salad", "Paneer Tikka Salad", "Corn Cucumber Salad", "Thai Crunch Salad", "Chickpea Salad"],
  "Juices & Shakes": ["Watermelon Juice", "Mosambi Juice", "Cold Coffee", "Mango Shake", "Banana Shake", "Oreo Shake", "Protein Smoothie", "Tender Coconut Water", "Mixed Fruit Juice", "Lassi"],
  "Ice Cream": ["Vanilla Scoop", "Chocolate Scoop", "Tender Coconut Ice Cream", "Mango Sundae", "Brownie Ice Cream", "Kulfi Stick", "Butterscotch Cup", "Belgian Chocolate Tub", "Strawberry Scoop", "Falooda Ice Cream"],
  "North East": ["Chicken Thukpa", "Veg Thukpa", "Pork Style Smoked Rice Bowl", "Aloo Pitika", "Bamboo Shoot Curry", "Momos Platter", "Jadoh Rice", "Naga Chilli Chicken", "Black Rice Pudding", "Lemon Tea"],
  Odia: ["Dalma", "Pakhala Bhata", "Chhena Poda", "Aloo Dum Dahibara", "Santula", "Machha Besara", "Odia Thali", "Khaja", "Chakuli Pitha", "Rasabali"],
  Hyderabadi: ["Hyderabadi Chicken Biryani", "Hyderabadi Mutton Biryani", "Bagara Rice", "Mirchi Ka Salan", "Haleem Bowl", "Dum Ka Chicken", "Pathar Ka Gosht", "Double Ka Meetha", "Qubani Ka Meetha", "Irani Chai"],
  Punjabi: ["Amritsari Kulcha", "Chole Bhature", "Sarson Saag", "Lassi", "Tandoori Roti", "Paneer Tikka", "Rajma Masala", "Butter Chicken", "Punjabi Thali", "Phirni"],
  Mughlai: ["Chicken Korma", "Galouti Kebab", "Roomali Roti", "Nihari", "Phirni", "Mutton Rogan Josh", "Paneer Lababdar", "Shahi Tukda", "Seekh Kebab", "Zafrani Pulao"],
  Bengali: ["Kosha Mangsho", "Luchi Aloor Dum", "Macher Jhol", "Mishti Doi", "Rosogolla", "Shorshe Ilish", "Mochar Ghonto", "Chicken Rezala", "Cholar Dal", "Sandesh"],
  Healthy: ["Millet Power Bowl", "Sprout Salad", "Quinoa Khichdi", "Protein Wrap", "Cold Pressed Juice", "Grilled Paneer Bowl", "Oats Upma", "Ragi Dosa", "Greek Yogurt Bowl", "Fruit Bowl"],
  Coastal: ["Fish Curry Rice", "Prawn Fry", "Neer Dosa", "Sol Kadhi", "Crab Masala", "Pomfret Fry", "Kori Rotti", "Goan Prawn Curry", "Coconut Rice", "Banana Fritters"],
  Gujarati: ["Mini Gujarati Thali", "Dhokla", "Thepla", "Undhiyu", "Khandvi", "Fafda Jalebi", "Sev Tameta", "Gujarati Kadhi", "Khichu", "Shrikhand"],
  Bakery: ["Bun Maska", "Veg Puff", "Fresh Croissant", "Banana Bread", "Cupcake Box", "Garlic Loaf", "Chocolate Donut", "Cheese Danish", "Multigrain Bread", "Fruit Tart"],
};

function restaurantName(city: string, cuisine: string, index: number, names: string[]) {
  if (names[index]) return names[index];
  const suffix = cuisine
    .replace("&", "and")
    .replace(/\s+/g, " ")
    .trim();
  const formats = [
    `${city} ${suffix} Kitchen`,
    `${suffix} House ${city}`,
    `${city} ${suffix} Studio`,
    `${suffix} Bowl Co ${city}`,
  ];
  return formats[index % formats.length];
}

const chefs: Row[] = allCities.flatMap((city, cityIndex) =>
  cuisines.map((cuisine, index) => ({
    id: cityIndex * 1000 + index + 1,
    name: restaurantName(
      city,
      cuisine,
      index,
      restaurants[city as keyof typeof restaurants] ?? [],
    ),
    tagline: `Top-rated ${cuisine.toLowerCase()} meals freshly cooked in ${city}.`,
    cuisine,
    rating: Number((4.9 - (index % 5) * 0.1).toFixed(1)),
    etaMinutes: 20 + ((cityIndex + index) % 18),
    deliveryFee: 15 + ((cityIndex + index) % 4) * 10,
    imageUrl: images[index % images.length],
    location: city,
    priceForTwo: 220 + index * 35,
    isVeg: !["Mughlai", "Bengali", "Chinese", "Coastal", "Biryani", "Arabian", "Japanese", "Korean", "BBQ & Grill", "Lebanese", "Turkish", "Vietnamese", "North East", "Hyderabadi"].includes(cuisine),
    featured: index < 4,
    opensAt: index % 3 === 0 ? "08:00" : index % 3 === 1 ? "10:00" : "11:30",
    closesAt: index % 4 === 0 ? "23:30" : "22:00",
    serviceAreas: [city],
  })),
);

const dishes: Row[] = chefs.flatMap((chef, chefIndex) =>
  (menuByCuisine[String(chef.cuisine)] ?? menuByCuisine["North Indian"]).map((name, dishIndex) => ({
    id: Number(chef.id) * 100 + dishIndex + 1,
    chefId: chef.id,
    name,
    description: `${name} prepared by ${chef.name} in ${chef.location}.`,
    price: 99 + ((chefIndex + dishIndex) % 12) * 22,
    imageUrl: images[(chefIndex + dishIndex) % images.length],
    isVeg: Boolean(chef.isVeg) || !/chicken|mutton|fish|prawn|crab|kebab|nihari/i.test(name),
    rating: chef.rating,
    spiceLevel: dishIndex % 3 === 0 ? "mild" : dishIndex % 3 === 1 ? "medium" : "spicy",
    popular: dishIndex < 3,
  })),
);

const products: Row[] = [
  ["Bananas", "Fresh Robusta bananas.", 54, 65, "1 dozen", "https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=600", 35],
  ["Apples", "Crisp red apples.", 149, 179, "1 kg", "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600", 35],
  ["Tomatoes", "Ripe hybrid tomatoes.", 36, 48, "1 kg", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600", 35],
  ["Onions", "Everyday red onions.", 42, 55, "1 kg", "https://images.unsplash.com/photo-1508747703725-719777637510?w=600", 35],
  ["Potatoes", "Fresh table potatoes.", 38, 50, "1 kg", "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600", 35],
  ["Carrots", "Crunchy orange carrots.", 52, 64, "500 g", "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=600", 35],
  ["Spinach", "Fresh palak bunch.", 28, 35, "1 bunch", "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600", 35],
  ["Mangoes", "Seasonal sweet mangoes.", 129, 159, "1 kg", "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600", 35],
  ["Milk", "Fresh toned milk pouch.", 32, 34, "500 ml", "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600", 36],
  ["Curd", "Thick set curd.", 45, 50, "400 g", "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600", 36],
  ["Paneer", "Soft malai paneer.", 95, 110, "200 g", "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600", 36],
  ["White Bread", "Fresh sandwich bread.", 45, 50, "400 g", "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600", 36],
  ["Eggs", "Farm fresh eggs.", 72, 84, "6 pcs", "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=600", 36],
  ["Cheese Slices", "Processed cheese slices.", 118, 135, "200 g", "https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=600", 36],
  ["Brown Bread", "Whole wheat bread loaf.", 58, 65, "400 g", "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600", 36],
  ["Basmati Rice", "Long grain basmati rice.", 169, 199, "1 kg", "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600", 37],
  ["Sona Masoori Rice", "Everyday raw rice.", 82, 96, "1 kg", "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=600", 37],
  ["Wheat Atta", "Stone-ground whole wheat atta.", 58, 68, "1 kg", "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600", 37],
  ["Toor Dal", "Premium toor dal.", 142, 165, "1 kg", "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?w=600", 37],
  ["Moong Dal", "Unpolished moong dal.", 128, 149, "1 kg", "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600", 37],
  ["Chana Dal", "Split bengal gram.", 92, 110, "1 kg", "https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=600", 37],
  ["Turmeric Powder", "Bright haldi powder.", 38, 45, "100 g", "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=600", 38],
  ["Red Chilli Powder", "Spicy chilli powder.", 42, 52, "100 g", "https://images.unsplash.com/photo-1526346698789-22fd84314424?w=600", 38],
  ["Garam Masala", "Aromatic blended masala.", 68, 82, "100 g", "https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=600", 38],
  ["Jeera", "Whole cumin seeds.", 55, 65, "100 g", "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600", 38],
  ["Potato Chips", "Classic salted chips.", 35, 40, "80 g", "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600", 39],
  ["Mixture Namkeen", "Crunchy spicy mixture.", 82, 95, "200 g", "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600", 39],
  ["Roasted Makhana", "Light roasted makhana.", 110, 130, "100 g", "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=600", 39],
  ["Biscuits", "Tea-time biscuits pack.", 28, 35, "150 g", "https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=600", 39],
  ["Tea Powder", "Strong tea blend.", 145, 170, "250 g", "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=600", 40],
  ["Coffee", "Instant coffee jar.", 175, 210, "100 g", "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600", 40],
  ["Orange Juice", "Ready-to-drink juice.", 95, 110, "1 L", "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600", 40],
  ["Mineral Water", "Packaged drinking water.", 20, 25, "1 L", "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=600", 40],
  ["Shampoo", "Daily care shampoo.", 148, 170, "180 ml", "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600", 41],
  ["Soap Bar", "Bathing soap pack.", 62, 75, "3 pcs", "https://images.unsplash.com/photo-1607006483224-06588f33ef2a?w=600", 41],
  ["Toothpaste", "Fresh gel toothpaste.", 92, 110, "150 g", "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600", 41],
  ["Detergent Powder", "Laundry detergent.", 118, 140, "1 kg", "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600", 42],
  ["Dishwash Liquid", "Lemon dishwash liquid.", 99, 120, "500 ml", "https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?w=600", 42],
  ["Floor Cleaner", "Disinfectant floor cleaner.", 129, 155, "1 L", "https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600", 42],
  ["Baby Diapers", "Soft diaper pants.", 399, 449, "24 pcs", "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600", 43],
  ["Baby Wipes", "Gentle wet wipes.", 92, 110, "72 pcs", "https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=600", 43],
  ["Frozen Peas", "Frozen green peas.", 86, 99, "500 g", "https://images.unsplash.com/photo-1587334207407-deb137a955ba?w=600", 44],
  ["Vanilla Ice Cream", "Classic vanilla tub.", 190, 220, "700 ml", "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600", 44],
  ["Frozen Paratha", "Ready-to-cook paratha.", 120, 145, "5 pcs", "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600", 44],
].map(([name, description, price, mrp, unit, imageUrl, categoryId], index): Row => ({
  id: index + 1,
  name: String(name),
  description: String(description),
  price: Number(price),
  mrp: Number(mrp),
  unit: String(unit),
  imageUrl: String(imageUrl),
  categoryId: Number(categoryId),
  inStock: true,
  essential: index < 8,
}));

const offers: Row[] = [
  { id: 1, title: "50% off your first order", subtitle: "Use WELCOME50", code: "WELCOME50", accentColor: "#f97316" },
  { id: 2, title: "Free delivery", subtitle: "On grocery orders over Rs 299", code: "FREESHIP", accentColor: "#16a34a" },
];

async function authedFetch(url: string, init: RequestInit = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}: ${await res.text()}`);
  return res;
}

function toFirestoreFields(row: Record<string, unknown>) {
  const fields: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    if (typeof value === "string") fields[key] = { stringValue: value };
    else if (typeof value === "number" && Number.isInteger(value)) fields[key] = { integerValue: value };
    else if (typeof value === "number") fields[key] = { doubleValue: value };
    else if (typeof value === "boolean") fields[key] = { booleanValue: value };
    else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map((item) => ({ stringValue: String(item) })),
        },
      };
    }
  }
  return fields;
}

async function uploadImage(url: string, folder: string, id: number) {
  if (process.env.UPLOAD_FIREBASE_IMAGES === "false") return url;

  let source = await fetch(url);
  if (!source.ok) {
    source = await fetch(fallbackImage);
  }
  if (!source.ok) throw new Error(`Image fetch failed: ${url}`);
  const bytes = Buffer.from(await source.arrayBuffer());
  const contentType = source.headers.get("content-type") ?? "image/jpeg";
  const objectName = `${folder}/${id}-${randomUUID()}.jpg`;
  const storageToken = randomUUID();
  const metadata = {
    name: objectName,
    contentType,
    metadata: { firebaseStorageDownloadTokens: storageToken },
  };
  const boundary = `seed_${randomUUID()}`;
  const body = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${contentType}\r\n\r\n`),
    bytes,
    Buffer.from(`\r\n--${boundary}--`),
  ]);
  await authedFetch(
    `https://storage.googleapis.com/upload/storage/v1/b/${storageBucket}/o?uploadType=multipart`,
    {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body,
    },
  );
  return `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodeURIComponent(objectName)}?alt=media&token=${storageToken}`;
}

async function writeCollection(name: string, rows: Row[]) {
  for (const row of rows) {
    const withStorage = row.imageUrl
      ? { ...row, imageUrl: await uploadImage(row.imageUrl, name, row.id) }
      : row;
    await authedFetch(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${name}/${row.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fields: toFirestoreFields(withStorage) }),
      },
    );
  }
  console.log(`Seeded ${rows.length} ${name}`);
}

async function main() {
  await writeCollection("categories", categories);
  await writeCollection("chefs", chefs);
  await writeCollection("dishes", dishes);
  await writeCollection("products", products);
  await writeCollection("offers", offers);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
