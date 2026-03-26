// routes/sharedCart.js
import { Router } from "express";
import {
  createSharedCart,
  getMySharedCarts,
  joinSharedCart,
  getSharedCart,
  addItemToSharedCart,
  updateSharedCartItem,
  removeSharedCartItem,
  leaveSharedCart,
  deleteSharedCart,
} from "../controllers/sharedCartController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.post("/",                         createSharedCart);      // יצירת סל
router.get("/",                          getMySharedCarts);      // כל הסלים שלי
router.post("/join",                     joinSharedCart);        // הצטרפות בקוד
router.get("/:id",                       getSharedCart);         // סל ספציפי
router.post("/:id/items",               addItemToSharedCart);   // הוספת פריט
router.patch("/:id/items/:name",        updateSharedCartItem);  // עדכון פריט
router.delete("/:id/items/:name",       removeSharedCartItem);  // מחיקת פריט
router.delete("/:id/leave",             leaveSharedCart);       // עזיבת סל
router.delete("/:id",                   deleteSharedCart);      // מחיקת סל (בעלים)

export default router;
