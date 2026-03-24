// db/client.js
// ─────────────────────────────────────────────────────────
// חיבור יחיד (Singleton) ל-MongoDB באמצעות ה-native driver.
// כל הקבצים שצריכים גישה ל-DB יקראו ל-getDB()
// ולא יפתחו חיבור חדש בעצמם.
// ─────────────────────────────────────────────────────────

import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";

let db = null; // מאוחסן פעם אחת לאורך כל חיי השרת
let memoryServer = null;

/**
 * מתחבר ל-MongoDB ושומר את ה-db instance.
 * אם כבר מחובר — מחזיר את החיבור הקיים.
 */
export const connectDB = async () => {
  if (db) return db;

  const dbName = process.env.DB_NAME || "smart-receipts";
  const mongoUri = process.env.MONGO_URI;

  if (mongoUri) {
    try {
      const client = new MongoClient(mongoUri);
      await client.connect();
      db = client.db(dbName);
      console.log("✅ MongoDB connected");
      return db;
    } catch (error) {
      console.warn(`⚠️ MongoDB connection failed (${error.message}). Falling back to in-memory DB.`);
    }
  } else {
    console.warn("⚠️ MONGO_URI is missing. Falling back to in-memory DB.");
  }

  memoryServer = await MongoMemoryServer.create({ instance: { dbName } });
  const memoryClient = new MongoClient(memoryServer.getUri());
  await memoryClient.connect();
  db = memoryClient.db(dbName);
  console.log("✅ In-memory MongoDB started");
  return db;
};

/**
 * מחזיר את ה-db instance הקיים.
 * יזרוק שגיאה אם connectDB לא נקרא קודם.
 */
export const getDB = () => {
  if (!db) throw new Error("DB not initialized. Call connectDB first.");
  return db;
};