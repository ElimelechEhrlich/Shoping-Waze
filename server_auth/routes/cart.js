// routes/cart.js
// ─────────────────────────────────────────────────────────
// כל routes של הסל — כולם מוגנים ב-JWT.
// חשוב: /store ו-/compare לפני /:name כדי למנוע clash
// ─────────────────────────────────────────────────────────

import { Router } from "express";
import {
  getCart, addToCart, updateCartItem,
  removeFromCart, setStore, compareCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.get("/",           getCart);         // GET    /api/cart
router.post("/",          addToCart);       // POST   /api/cart
router.put("/store",      setStore);        // PUT    /api/cart/store
router.post("/compare",   compareCart);     // POST   /api/cart/compare
router.patch("/:name",    updateCartItem);  // PATCH  /api/cart/:name
router.delete("/:name",   removeFromCart);  // DELETE /api/cart/:name

export default router;
