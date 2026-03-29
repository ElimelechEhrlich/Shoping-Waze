// index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { connectDB } from "./db/client.js";
import { createIndexes } from "./models/User.js";
import authRoutes        from "./routes/auth.js";
import productsRoutes    from "./routes/products.js";
import cartRoutes        from "./routes/cart.js";
import sharedCartRoutes  from "./routes/sharedCart.js";
import historyRoutes     from "./routes/history.js";
import reportsRoutes     from "./routes/reports.js";
import { ensureReportIndexes } from "./controllers/reportsController.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

// ── API routes ────────────────────────────────────────────
app.use("/api/auth",         authRoutes);
app.use("/api/products",     productsRoutes);
app.use("/api/cart",         cartRoutes);
app.use("/api/shared-carts", sharedCartRoutes);
app.use("/api/history",      historyRoutes);
app.use("/api/reports",      reportsRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

// ── Serve React SPA (if build exists) ────────────────────
// This handles SPA routing when the frontend is served by this server,
// ensuring page refreshes on any client-side route return index.html.
const clientDist = path.resolve(__dirname, "../client/dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

const start = async () => {
  await connectDB();
  await createIndexes();
  await ensureReportIndexes();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

start().catch((err) => {
  console.error("❌ Failed to start:", err.message);
  process.exit(1);
});
