// index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db/client.js";
import { createIndexes } from "./models/User.js";
import authRoutes     from "./routes/auth.js";
import productsRoutes from "./routes/products.js";
import cartRoutes     from "./routes/cart.js";
import { config } from "dotenv";
config()
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth",     authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart",     cartRoutes);

app.get("/api/health", (_, res) => res.json({ status: "ok" }));

const start = async () => {
  await connectDB();
  await createIndexes();
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
};

start().catch((err) => {
  console.error("❌ Failed to start:", err.message);
  process.exit(1);
});
