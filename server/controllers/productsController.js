// controllers/productsController.js
// ─────────────────────────────────────────────────────────
// מחזיר את המוצרים הפופולריים של המשתמש המחובר.
// מחשב פופולריות לפי סיכום ה-quantity של כל מוצר ב-cart.
// ─────────────────────────────────────────────────────────

import { findById } from "../models/User.js";

/**
 * GET /api/products/popular
 * מוגן ב-protect middleware — req.user תמיד קיים כאן.
 *
 * מחזיר מערך של מוצרים ממוינים לפי כמות כוללת (יורד),
 * מוגבל ל-10 תוצאות.
 */
export const getPopularProducts = async (req, res) => {
  try {
    // שליפת המשתמש עם ה-cart המלא
    const user = await findById(req.user._id.toString());

    if (!user || !user.cart || user.cart.length === 0) {
      return res.status(200).json({ success: true, products: [] });
    }

    // צבירה: מאחד פריטים עם אותו שם מוצר וסופר
    // ומסכם את ה-quantity שלהם
    const aggregated = {};

    for (const item of user.cart) {
      // מפתח ייחודי: שם מוצר + שם סופרמרקט
      const key = `${item.productName}__${item.store}`;

      if (aggregated[key]) {
        aggregated[key].totalQuantity += item.quantity;
        aggregated[key].totalPrice   += item.price * item.quantity;
      } else {
        aggregated[key] = {
          productName:   item.productName,
          store:         item.store,
          totalQuantity: item.quantity,
          totalPrice:    item.price * item.quantity,
          unitPrice:     item.price,
        };
      }
    }

    // מיון יורד לפי totalQuantity, חיתוך ל-10 ראשונים
    const products = Object.values(aggregated)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10);

    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error("getPopularProducts error:", error);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};
