// controllers/cartController.js
// ─────────────────────────────────────────────────────────
// לוגיקת ניהול סל הקניות + השוואת מחירים.
//
// JSON שמגיע מהצוות (addToCart):
// { "data": [{ "items": [{ "name":"milk","qty":1,"price":3.5,"category":"dairy" }] }] }
//
// השוואת מחירים — נשלח ל-AI agent:
// { "items": [{ "name": "milk", "qty": 1 }] }
// ─────────────────────────────────────────────────────────

import { getDB } from "../db/client.js";
import { ObjectId } from "mongodb";

const getCollection = () => getDB().collection("users");

// URL של ה-AI agent — יעודכן כשחבר הצוות יתן את ה-endpoint
const AI_AGENT_URL = process.env.AI_AGENT_URL || null;

// ── GET /api/cart ─────────────────────────────────────────
export const getCart = async (req, res) => {
  try {
    const user = await getCollection().findOne(
      { _id: new ObjectId(req.user._id) },
      { projection: { cart: 1, selectedStore: 1 } }
    );
    res.status(200).json({
      success: true,
      cart:          user.cart          || [],
      selectedStore: user.selectedStore || null,
    });
  } catch (err) {
    console.error("getCart error:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};

// ── POST /api/cart ────────────────────────────────────────
// מקבל JSON מהצוות ומוסיף/ממזג לסל הקיים
export const addToCart = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data) || !data[0]?.items)
      return res.status(400).json({ success: false, message: "מבנה JSON לא תקין" });

    const incomingItems = data[0].items;

    const user = await getCollection().findOne(
      { _id: new ObjectId(req.user._id) },
      { projection: { cart: 1 } }
    );
    const currentCart = user.cart || [];

    // מיזוג — אם קיים מחבר כמויות, אחרת מוסיף
    const updatedCart = [...currentCart];
    for (const item of incomingItems) {
      const idx = updatedCart.findIndex(
        (c) => c.name.toLowerCase() === item.name.toLowerCase()
      );
      if (idx >= 0) {
        updatedCart[idx].qty   += item.qty;
        // עדכון מחיר רק אם הגיע מחיר חדש תקין
        if (item.price > 0) updatedCart[idx].price = item.price;
      } else {
        updatedCart.push({
          name:     item.name,
          qty:      item.qty,
          price:    item.price    ?? 0,
          category: item.category || "כללי",
          addedAt:  new Date(),
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
export const updateCartItem = async (req, res) => {
  try {
    const { name }          = req.params;
    const { qty, price, category } = req.body;

    const user = await getCollection().findOne(
      { _id: new ObjectId(req.user._id) },
      { projection: { cart: 1 } }
    );

    const cart = user.cart || [];
    const idx  = cart.findIndex(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );

    if (idx < 0)
      return res.status(404).json({ success: false, message: "מוצר לא נמצא" });

    if (qty      !== undefined) cart[idx].qty      = qty;
    if (price    !== undefined) cart[idx].price    = price;
    if (category !== undefined) cart[idx].category = category;

    // כמות 0 → מחיקה
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
export const setStore = async (req, res) => {
  try {
    const { store } = req.body;
    const VALID = ["שופרסל", "רמי לוי", "ויקטורי", "מגה"];
    if (!VALID.includes(store))
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

// ── POST /api/cart/compare ────────────────────────────────
// שולח את הסל ל-AI agent ומחזיר השוואת מחירים.
// כשחבר הצוות נותן URL — מעדכנים AI_AGENT_URL ב-.env
export const compareCart = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0)
      return res.status(400).json({ success: false, message: "הסל ריק" });

    // ── אם ה-AI agent מוכן ─────────────────────────────
    if (AI_AGENT_URL) {
      const agentRes = await fetch(AI_AGENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const agentData = await agentRes.json();
      return res.status(200).json({ success: true, results: agentData });
    }

    // ── Mock — עד שה-AI agent מוכן ─────────────────────
    // מדמה תשובה עם השוואת מחירים בין רשתות
    const stores = ["שופרסל", "רמי לוי", "ויקטורי", "מגה"];
    const mockResults = stores.map((store) => {
      const storeItems = items.map((item) => {
        // מחיר אקראי קצת שונה לכל רשת (±20%)
        const basePrice = Math.random() * 10 + 3;
        const unitPrice = parseFloat(basePrice.toFixed(2));
        return {
          name:      item.name,
          qty:       item.qty,
          unitPrice,
          total:     parseFloat((unitPrice * item.qty).toFixed(2)),
          available: Math.random() > 0.1, // 90% זמין
        };
      });

      const total = parseFloat(
        storeItems.reduce((s, i) => s + (i.available ? i.total : 0), 0).toFixed(2)
      );

      return { store, total, items: storeItems };
    });

    // מיון לפי מחיר — הזול ביותר ראשון
    mockResults.sort((a, b) => a.total - b.total);
    const cheapest = mockResults[0].store;

    res.status(200).json({
      success: true,
      results: { results: mockResults, cheapest },
    });
  } catch (err) {
    console.error("compareCart error:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};
