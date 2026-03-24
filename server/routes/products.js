// routes/products.js
// ─────────────────────────────────────────────────────────
// Routes של מוצרים — כולם מוגנים ב-JWT.
// ─────────────────────────────────────────────────────────

import { Router } from "express";
import { getPopularProducts } from "../controllers/productsController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// כל routes המוצרים דורשים התחברות
router.use(protect);

// GET /api/products/popular
router.get("/popular", getPopularProducts);

export default router;
