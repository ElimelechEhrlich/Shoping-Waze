// routes/products.js
// ─────────────────────────────────────────────────────────
// Routes של מוצרים — כולם מוגנים ב-JWT.
// ─────────────────────────────────────────────────────────

import { Router } from "express";
import { getPopularProducts, getAllProducts } from "../controllers/productsController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/popular",  getPopularProducts); // GET /api/products/popular
router.get("/",         getAllProducts);      // GET /api/products

export default router;
