const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const User = require("./models/User");
const MenuCategory = require("./models/MenuCategory");
const MenuItem = require("./models/Menu");
const Table = require("./models/Table");

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await MenuCategory.deleteMany({});
    await MenuItem.deleteMany({});
    await Table.deleteMany({});

    // Create Users
    const adminPassword = await bcrypt.hash("admin123", 10);
    const staffPassword = await bcrypt.hash("staff123", 10);
    const customerPassword = await bcrypt.hash("123456", 10);

    const users = await User.create([
      {
        name: "Admin User",
        email: "admin@restaurant.com",
        passwordHash: adminPassword,
        role: "admin"
      },
      {
        name: "Staff Member",
        email: "staff@restaurant.com",
        passwordHash: staffPassword,
        role: "staff"
      },
      {
        name: "Test Customer",
        email: "test@example.com",
        passwordHash: customerPassword,
        role: "customer"
      }
    ]);

    console.log("✅ Users created");

    // Create Categories
    const categories = await MenuCategory.create([
      { name: "Starters", displayOrder: 1, icon: "🥗" },
      { name: "Main Course", displayOrder: 2, icon: "🍛" },
      { name: "International", displayOrder: 3, icon: "🌍" },
      { name: "Beverages", displayOrder: 4, icon: "🥤" },
      { name: "Desserts", displayOrder: 5, icon: "🍰" }
    ]);

    console.log("✅ Categories created");

    // Create Menu Items - 15 Total (10 Indian + 5 International)
    const menuItems = await MenuItem.create([
      // INDIAN STARTERS (3 items)
      {
        name: "Paneer Tikka",
        description: "Grilled cottage cheese marinated in yogurt and spices",
        price: 179,
        categoryId: categories[0]._id,
        imageUrl: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=300&h=200&fit=crop",
        tags: ["vegetarian", "grilled", "indian", "spicy"],
        availability: true,
        popularity: 85
      },
      {
        name: "Chicken Tikka",
        description: "Tender chicken pieces marinated in aromatic spices",
        price: 199,
        categoryId: categories[0]._id,
        imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=300&h=200&fit=crop",
        tags: ["chicken", "grilled", "indian", "spicy"],
        availability: true,
        popularity: 90
      },
      {
        name: "Samosa (2 pcs)",
        description: "Crispy pastry filled with spiced potatoes and peas",
        price: 49,
        categoryId: categories[0]._id,
        imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=300&h=200&fit=crop",
        tags: ["vegetarian", "crispy", "indian", "snack"],
        availability: true,
        popularity: 75
      },
      
      // INDIAN MAIN COURSE (5 items)
      {
        name: "Chicken Biryani",
        description: "Aromatic basmati rice with tender chicken and traditional spices",
        price: 299,
        categoryId: categories[1]._id,
        imageUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&h=200&fit=crop",
        tags: ["rice", "chicken", "spicy", "indian"],
        availability: true,
        popularity: 95
      },
      {
        name: "Paneer Butter Masala",
        description: "Creamy tomato curry with soft paneer cubes",
        price: 249,
        categoryId: categories[1]._id,
        imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=300&h=200&fit=crop",
        tags: ["vegetarian", "curry", "creamy", "indian"],
        availability: true,
        popularity: 88
      },
      {
        name: "Dal Tadka",
        description: "Yellow lentils tempered with cumin and garlic",
        price: 149,
        categoryId: categories[1]._id,
        imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=300&h=200&fit=crop",
        tags: ["vegetarian", "lentils", "healthy", "indian"],
        availability: true,
        popularity: 70
      },
      {
        name: "Butter Chicken",
        description: "Tender chicken in rich tomato and butter gravy",
        price: 279,
        categoryId: categories[1]._id,
        imageUrl: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=300&h=200&fit=crop",
        tags: ["chicken", "curry", "creamy", "indian"],
        availability: true,
        popularity: 92
      },
      {
        name: "Chole Bhature",
        description: "Spicy chickpea curry with fluffy fried bread",
        price: 189,
        categoryId: categories[1]._id,
        imageUrl: "https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=300&h=200&fit=crop",
        tags: ["vegetarian", "spicy", "indian", "bread"],
        availability: true,
        popularity: 80
      },
      
      // INDIAN BEVERAGES & DESSERT (2 items)
      {
        name: "Masala Chai",
        description: "Traditional Indian spiced tea with cardamom and ginger",
        price: 25,
        categoryId: categories[3]._id,
        imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300&h=200&fit=crop",
        tags: ["hot", "spiced", "indian", "tea"],
        availability: true,
        popularity: 85
      },
      {
        name: "Chocolate Cookies (4 pcs)",
        description: "Freshly baked chocolate chip cookies",
        price: 79,
        categoryId: categories[4]._id,
        imageUrl: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=300&h=200&fit=crop",
        tags: ["sweet", "cookies", "dessert", "chocolate"],
        availability: true,
        popularity: 78
      },
      
      // INTERNATIONAL DISHES (5 items)
      {
        name: "Margherita Pizza",
        description: "Classic Italian pizza with fresh mozzarella and basil",
        price: 249,
        categoryId: categories[2]._id,
        imageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=300&h=200&fit=crop",
        tags: ["vegetarian", "cheese", "italian", "pizza"],
        availability: true,
        popularity: 88
      },
      {
        name: "Chicken Burger",
        description: "Juicy grilled chicken patty with lettuce and mayo",
        price: 199,
        categoryId: categories[2]._id,
        imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&h=200&fit=crop",
        tags: ["chicken", "burger", "american", "fast-food"],
        availability: true,
        popularity: 82
      },
      {
        name: "Pasta Alfredo",
        description: "Creamy white sauce pasta with herbs and parmesan",
        price: 229,
        categoryId: categories[2]._id,
        imageUrl: "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=300&h=200&fit=crop",
        tags: ["vegetarian", "pasta", "italian", "creamy"],
        availability: true,
        popularity: 75
      },
      {
        name: "Cold Coffee",
        description: "Chilled coffee with ice cream and whipped cream",
        price: 89,
        categoryId: categories[3]._id,
        imageUrl: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=200&fit=crop",
        tags: ["cold", "coffee", "sweet", "refreshing"],
        availability: true,
        popularity: 70
      },
      {
        name: "Chocolate Brownie",
        description: "Rich chocolate brownie served with vanilla ice cream",
        price: 129,
        categoryId: categories[4]._id,
        imageUrl: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=300&h=200&fit=crop",
        tags: ["chocolate", "dessert", "sweet", "western"],
        availability: true,
        popularity: 85
      }
    ]);

    console.log("✅ Menu items created");

    // Create Tables
    const tables = await Table.create([
      { number: 1, qrSlug: "table-1-" + Date.now(), capacity: 2 },
      { number: 2, qrSlug: "table-2-" + Date.now(), capacity: 4 },
      { number: 3, qrSlug: "table-3-" + Date.now(), capacity: 4 },
      { number: 4, qrSlug: "table-4-" + Date.now(), capacity: 6 },
      { number: 5, qrSlug: "table-5-" + Date.now(), capacity: 8 }
    ]);

    console.log("✅ Tables created");

    console.log("\n🎉 Sample data seeded successfully!");
    console.log("\n📋 Login Credentials:");
    console.log("Admin: admin@restaurant.com / admin123");
    console.log("Staff: staff@restaurant.com / staff123");
    console.log("Customer: test@example.com / 123456");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seedData();