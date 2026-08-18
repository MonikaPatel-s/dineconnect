const mongoose = require("mongoose");
const Table = require("../models/Table");
require("dotenv").config();

const createTables = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/dineconnect");
    console.log("✅ Connected to MongoDB");

    // Clear existing tables
    await Table.deleteMany({});
    console.log("🗑️ Cleared existing tables");

    // Create sample tables
    const tables = [];
    for (let i = 1; i <= 10; i++) {
      const qrSlug = `table-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      tables.push({
        number: i,
        qrSlug: qrSlug,
        capacity: i <= 4 ? 2 : i <= 8 ? 4 : 6,
        isActive: true
      });
    }

    const createdTables = await Table.insertMany(tables);
    console.log(`✅ Created ${createdTables.length} tables`);

    // Display table info
    console.log("\n📋 Created Tables:");
    createdTables.forEach(table => {
      const menuUrl = `http://localhost:3001/m/${table.qrSlug}`;
      console.log(`Table ${table.number}: ${menuUrl}`);
    });

    console.log("\n🎉 Tables created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    process.exit(1);
  }
};

createTables();