// routes/cart.js
// ─────────────────────────────────────────────────────────
// כל routes של הסל — כולם מוגנים ב-JWT.
// ─────────────────────────────────────────────────────────

import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  setStore,
} from "../controllers/cartController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect); // כל הroutes דורשים התחברות

router.get("/",          getCart);          // GET    /api/cart
router.post("/",         addToCart);        // POST   /api/cart
router.patch("/:name",   updateCartItem);   // PATCH  /api/cart/:name
router.delete("/:name",  removeFromCart);   // DELETE /api/cart/:name
router.put("/store",     setStore);         // PUT    /api/cart/store

export default router;
