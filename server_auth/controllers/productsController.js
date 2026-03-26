// controllers/productsController.js
// ─────────────────────────────────────────────────────────
// שליפת מוצרים מה-DB.
// חבר הצוות אחראי על ה-collection "products" ומבנה הנתונים.
//
// מבנה מוצר צפוי מה-DB:
// { _id, name, price, category, unit }
// ─────────────────────────────────────────────────────────

import { findById } from "../models/User.js";
import { getDB } from "../db/client.js";

// ── GET /api/products/popular ─────────────────────────────
// מוצרים פופולריים מה-cart של המשתמש
export const getPopularProducts = async (req, res) => {
  try {
    const user = await findById(req.user._id.toString());

    if (!user || !user.cart || user.cart.length === 0)
      return res.status(200).json({ success: true, products: [] });

    const aggregated = {};
    for (const item of user.cart) {
      const key = `${item.name}__${item.category}`;
      if (aggregated[key]) {
        aggregated[key].totalQuantity += item.qty;
        aggregated[key].totalPrice   += item.price * item.qty;
      } else {
        aggregated[key] = {
          productName:   item.name,
          store:         item.category,
          totalQuantity: item.qty,
          totalPrice:    item.price * item.qty,
          unitPrice:     item.price,
        };
      }
    }

    const products = Object.values(aggregated)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10);

    res.status(200).json({ success: true, products });
  } catch (err) {
    console.error("getPopularProducts error:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};

// ── GET /api/products ─────────────────────────────────────
// כל המוצרים מה-DB (collection שחבר הצוות יוצר)
export const getAllProducts = async (req, res) => {
  try {
    const db = getDB();
    const products = await db.collection("products").find({}).toArray();
    res.status(200).json({ success: true, products });
  } catch (err) {
    console.error("getAllProducts error:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};
