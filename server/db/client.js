// db/client.js
// ─────────────────────────────────────────────────────────
// חיבור יחיד (Singleton) ל-MongoDB באמצעות ה-native driver.
// כל הקבצים שצריכים גישה ל-DB יקראו ל-getDB()
// ולא יפתחו חיבור חדש בעצמם.
// ─────────────────────────────────────────────────────────

import { MongoClient } from "mongodb";

let db = null; // מאוחסן פעם אחת לאורך כל חיי השרת

/**
 * מתחבר ל-MongoDB ושומר את ה-db instance.
 * אם כבר מחובר — מחזיר את החיבור הקיים.
 */
export const connectDB = async () => {
  if (db) return db;

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();

  db = client.db(process.env.DB_NAME || "smart-receipts");
  console.log("✅ MongoDB connected");
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