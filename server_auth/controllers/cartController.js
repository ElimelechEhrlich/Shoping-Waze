// controllers/cartController.js
// ─────────────────────────────────────────────────────────
// לוגיקת ניהול סל הקניות.
//
// JSON שמגיע מהצוות:
// {
//   "data": [{
//     "items": [
//       { "name": "milk", "qty": 1, "price": 3.5, "category": "dairy" }
//     ]
//   }]
// }
// ─────────────────────────────────────────────────────────

import { getDB } from "../db/client.js";
import { ObjectId } from "mongodb";

const getCollection = () => getDB().collection("users");

// ── GET /api/cart ─────────────────────────────────────────
// מחזיר את הסל הנוכחי + הסופרמרקט שנבחר
export const getCart = async (req, res) => {
  try {
    const user = await getCollection().findOne(
      { _id: new ObjectId(req.user._id) },
      { projection: { cart: 1, selectedStore: 1 } }
    );
    res.status(200).json({
      success: true,
      cart: user.cart || [],
      selectedStore: user.selectedStore || null,
    });
  } catch (err) {
    console.error("getCart error:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};

// ── POST /api/cart ────────────────────────────────────────
// מקבל JSON מהצוות ומוסיף לסל הקיים.
// אם מוצר כבר קיים — מעדכן כמות, לא מוסיף כפול.
export const addToCart = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data) || !data[0]?.items) {
      return res.status(400).json({ success: false, message: "מבנה JSON לא תקין" });
    }

    const incomingItems = data[0].items;

    // שליפת הסל הנוכחי
    const user = await getCollection().findOne(
      { _id: new ObjectId(req.user._id) },
      { projection: { cart: 1 } }
    );
    const currentCart = user.cart || [];

    // מיזוג: אם המוצר קיים — מחבר כמויות, אחרת מוסיף
    const updatedCart = [...currentCart];
    for (const item of incomingItems) {
      const existing = updatedCart.findIndex(
        (c) => c.name.toLowerCase() === item.name.toLowerCase()
      );
      if (existing >= 0) {
        updatedCart[existing].qty += item.qty;
      } else {
        updatedCart.push({
          name:      item.name,
          qty:       item.qty,
          price:     item.price ?? 0,
          category:  item.category || "כללי",
          addedAt:   new Date(),
        });
      }
    }

    await getCollection().updateOne(
      { _id: new ObjectId(req.user._id) },
      { $set: { cart: updatedCart, updatedAt: new Date() } }
    );

    res.status(200).json({ success: true, cart: updatedCart });
  } catch (err) {
    console.error("addToCart error:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};

// ── PATCH /api/cart/:name ─────────────────────────────────
// עדכון כמות ומחיר של פריט ספציפי
export const updateCartItem = async (req, res) => {
  try {
    const { name } = req.params;
    const { qty, price } = req.body;

    const user = await getCollection().findOne(
      { _id: new ObjectId(req.user._id) },
      { projection: { cart: 1 } }
    );

    const cart = user.cart || [];
    const idx = cart.findIndex(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );

    if (idx < 0)
      return res.status(404).json({ success: false, message: "מוצר לא נמצא" });

    // עדכון כמות ו/או מחיר אם סופקו
    if (qty !== undefined)  cart[idx].qty   = qty;
    if (price !== undefined) cart[idx].price = price;

    // אם כמות הגיעה ל-0 — מוחקים את הפריט
    if (cart[idx].qty <= 0) cart.splice(idx, 1);

    await getCollection().updateOne(
      { _id: new ObjectId(req.user._id) },
      { $set: { cart, updatedAt: new Date() } }
    );

    res.status(200).json({ success: true, cart });
  } catch (err) {
    console.error("updateCartItem error:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};

// ── DELETE /api/cart/:name ────────────────────────────────
// מחיקת פריט מהסל לפי שם
export const removeFromCart = async (req, res) => {
  try {
    const { name } = req.params;

    const user = await getCollection().findOne(
      { _id: new ObjectId(req.user._id) },
      { projection: { cart: 1 } }
    );

    const cart = (user.cart || []).filter(
      (c) => c.name.toLowerCase() !== name.toLowerCase()
    );

    await getCollection().updateOne(
      { _id: new ObjectId(req.user._id) },
      { $set: { cart, updatedAt: new Date() } }
    );

    res.status(200).json({ success: true, cart });
  } catch (err) {
    console.error("removeFromCart error:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};

// ── PUT /api/cart/store ───────────────────────────────────
// שמירת הסופרמרקט שנבחר לכל הסל
export const setStore = async (req, res) => {
  try {
    const { store } = req.body;

    const VALID_STORES = ["שופרסל", "רמי לוי", "ויקטורי", "מגה"];
    if (!VALID_STORES.includes(store))
      return res.status(400).json({ success: false, message: "סופרמרקט לא תקין" });

    await getCollection().updateOne(
      { _id: new ObjectId(req.user._id) },
      { $set: { selectedStore: store, updatedAt: new Date() } }
    );

    res.status(200).json({ success: true, selectedStore: store });
  } catch (err) {
    console.error("setStore error:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};
