const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const dbName = ""; // Your actual DB name

async function exportAllCollectionsToJSON() {
  const client = new MongoClient(uri);

  try {
    console.log("🔌 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(dbName);

    const collections = await db.listCollections().toArray();

    const exportDir = path.join(__dirname, "exported_collections");
    if (!fs.existsSync(exportDir)) {
      try {
        fs.mkdirSync(exportDir);
        console.log("📂 Export directory created:", exportDir);
      } catch (dirErr) {
        console.error("❌ Failed to create export directory:", dirErr.message);
        return;
      }
    }

    for (const col of collections) {
      const colName = col.name;

      try {
        const data = await db.collection(colName).find({}).toArray();

        const filePath = path.join(exportDir, `${colName}.json`);
        try {
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
        } catch (writeErr) {
          console.error(
            `❌ Failed to write file ${colName}.json:`,
            writeErr.message
          );
        }
      } catch (fetchErr) {
        console.error(
          `❌ Error fetching data from collection ${colName}:`,
          fetchErr.message
        );
      }
    }

    console.log(`🎉 All collections exported successfully to ${exportDir}`);
  } catch (err) {
    console.error(
      "❌ Error connecting to MongoDB or fetching collections:",
      err.message
    );
  } finally {
    try {
      await client.close();
      console.log("🔌 Connection to MongoDB closed");
    } catch (closeErr) {
      console.error("❌ Error closing MongoDB connection:", closeErr.message);
    }
  }
}

exportAllCollectionsToJSON();
