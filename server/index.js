// index.js
// ─────────────────────────────────────────────────────────
// נקודת כניסה לשרת.
// אחראי על: טעינת env, חיבור ל-DB, הרשמת middleware ו-routes,
// והרצת השרת.
// ─────────────────────────────────────────────────────────

import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db/client.js";
import { createIndexes } from "./models/User.js";
import authRoutes from "./routes/auth.js";

const app = express();

// ── Global Middleware ──────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json()); // פירוש JSON מגוף הבקשה

// ── Routes ─────────────────────────────────────────────
app.use("/api/auth", authRoutes);

// בדיקת תקינות השרת
app.get("/api/health", (_, res) => res.json({ status: "ok" }));

// ── Startup ────────────────────────────────────────────
const start = async () => {
  await connectDB();          // חיבור ל-MongoDB
  await createIndexes();      // הבטחת unique index על email

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

start().catch((err) => {
  console.error("❌ Failed to start:", err.message);
  process.exit(1);
});