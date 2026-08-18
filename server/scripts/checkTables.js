const mongoose = require("mongoose");
const Table = require("../models/Table");
require("dotenv").config();

const checkTables = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/dineconnect");
    console.log("✅ Connected to MongoDB");

    // Get all tables
    const tables = await Table.find({});
    console.log(`📋 Found ${tables.length} tables in database:`);

    tables.forEach(table => {
      console.log(`Table ${table.number}: ${table.qrSlug} (Active: ${table.isActive})`);
    });

    // Test specific table lookup
    const testSlug = "table-1-1762347240202-dmaxjq17s";
    const testTable = await Table.findOne({ qrSlug: testSlug, isActive: true });
    
    if (testTable) {
      console.log(`\n✅ Test lookup successful for ${testSlug}:`);
      console.log(`   Table ID: ${testTable._id}`);
      console.log(`   Number: ${testTable.number}`);
      console.log(`   Capacity: ${testTable.capacity}`);
    } else {
      console.log(`\n❌ Test lookup failed for ${testSlug}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
};

checkTables();