// controllers/sharedCartController.js
// ─────────────────────────────────────────────────────────
// ניהול סל שיתופי — יצירה, הצטרפות, עדכון פריטים, עזיבה.
//
// תהליך:
//  1. המשתמש יוצר סל שיתופי → מקבל קוד 6 ספרות
//  2. שולח את הקוד לחבר
//  3. החבר מזין את הקוד → מצטרף לסל
//  4. שניהם יכולים להוסיף/לעדכן/למחוק פריטים
//  5. הסל האישי של כל אחד נשאר ללא שינוי
// ─────────────────────────────────────────────────────────

import { getDB } from "../db/client.js";
import { ObjectId } from "mongodb";
import crypto from "crypto";

const col = () => getDB().collection("sharedCarts");
const usersCol = () => getDB().collection("users");

// קוד הזמנה — 6 תווים אלפא-נומריים ל-מזרחי (UpperCase)
const genCode = () =>
  crypto.randomBytes(4).toString("hex").toUpperCase().slice(0, 6);

const safeQty = (v) => Math.max(1, Math.round(Number(v) || 1));

// ── POST /api/shared-carts ────────────────────────────────
// יוצר סל שיתופי חדש
export const createSharedCart = async (req, res) => {
  try {
    const { name = "הסל המשותף שלי" } = req.body;
    const ownerId = new ObjectId(req.user._id);

    const owner = await usersCol().findOne(
      { _id: ownerId },
      { projection: { name: 1, email: 1 } }
    );

    let inviteCode;
    let attempts = 0;
    do {
      inviteCode = genCode();
      const existing = await col().findOne({ inviteCode });
      if (!existing) break;
      attempts++;
    } while (attempts < 10);

    const doc = {
      name,
      ownerId,
      members: [
        { userId: ownerId, displayName: owner.name || owner.email, joinedAt: new Date() },
      ],
      inviteCode,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await col().insertOne(doc);
    res.status(201).json({
      success: true,
      sharedCart: { ...doc, _id: result.insertedId },
    });
  } catch (err) {
    console.error("createSharedCart error:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};

// ── GET /api/shared-carts ─────────────────────────────────
// מחזיר את כל הסלים השיתופיים שהמשתמש חבר בהם
export const getMySharedCarts = async (req, res) => {
  try {
    const userId = new ObjectId(req.user._id);

    const carts = await col()
      .find({ "members.userId": userId })
      .sort({ updatedAt: -1 })
      .toArray();

    res.status(200).json({ success: true, sharedCarts: carts });
  } catch (err) {
    console.error("getMySharedCarts error:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};

// ── POST /api/shared-carts/join ───────────────────────────
// הצטרפות לסל עם קוד הזמנה
export const joinSharedCart = async (req, res) => {
  try {
    const { inviteCode } = req.body;
    if (!inviteCode)
      return res.status(400).json({ success: false, message: "נדרש קוד הזמנה" });

    const cart = await col().findOne({ inviteCode: inviteCode.toUpperCase() });
    if (!cart)
      return res.status(404).json({ success: false, message: "קוד הזמנה לא תקין" });

    const userId = new ObjectId(req.user._id);
    const alreadyMember = cart.members.some(
      (m) => m.userId.toString() === userId.toString()
    );
    if (alreadyMember)
      return res.status(200).json({ success: true, sharedCart: cart, alreadyMember: true });

    const user = await usersCol().findOne(
      { _id: userId },
      { projection: { name: 1, email: 1 } }
    );

    await col().updateOne(
      { _id: cart._id },
      {
        $push: {
          members: {
            userId,
            displayName: user.name || user.email,
            joinedAt: new Date(),
          },
        },
        $set: { updatedAt: new Date() },
      }
    );

    const updated = await col().findOne({ _id: cart._id });
    res.status(200).json({ success: true, sharedCart: updated });
  } catch (err) {
    console.error("joinSharedCart error:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};

// ── GET /api/shared-carts/:id ─────────────────────────────
export const getSharedCart = async (req, res) => {
  try {
    const { id } = req.params;
    const cart = await col().findOne({ _id: new ObjectId(id) });
    if (!cart)
      return res.status(404).json({ success: false, message: "סל לא נמצא" });

    const userId = new ObjectId(req.user._id);
    const isMember = cart.members.some(
      (m) => m.userId.toString() === userId.toString()
    );
    if (!isMember)
      return res.status(403).json({ success: false, message: "אין הרשאה לצפות בסל זה" });

    res.status(200).json({ success: true, sharedCart: cart });
  } catch (err) {
    console.error("getSharedCart error:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};

// ── POST /api/shared-carts/:id/items ─────────────────────
// הוספת / מיזוג פריט לסל שיתופי
export const addItemToSharedCart = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, qty, price, category } = req.body;

    if (!name)
      return res.status(400).json({ success: false, message: "שם מוצר נדרש" });

    const cart = await col().findOne({ _id: new ObjectId(id) });
    if (!cart)
      return res.status(404).json({ success: false, message: "סל לא נמצא" });

    const userId = new ObjectId(req.user._id);
    const isMember = cart.members.some(
      (m) => m.userId.toString() === userId.toString()
    );
    if (!isMember)
      return res.status(403).json({ success: false, message: "אין הרשאה" });

    const items = [...cart.items];
    const idx = items.findIndex(
      (i) => i.name.toLowerCase() === name.toLowerCase()
    );

    if (idx >= 0) {
      items[idx].qty += safeQty(qty);
      if (price > 0) items[idx].price = price;
    } else {
      items.push({
        name,
        qty:      safeQty(qty),
        price:    price    ?? 0,
        category: category || "כללי",
        addedBy:  userId,
        addedAt:  new Date(),
      });
    }

    await col().updateOne(
      { _id: new ObjectId(id) },
      { $set: { items, updatedAt: new Date() } }
    );

    res.status(200).json({ success: true, items });
  } catch (err) {
    console.error("addItemToSharedCart error:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};

// ── PATCH /api/shared-carts/:id/items/:name ───────────────
export const updateSharedCartItem = async (req, res) => {
  try {
    const { id, name } = req.params;
    const { qty, price } = req.body;

    const cart = await col().findOne({ _id: new ObjectId(id) });
    if (!cart)
      return res.status(404).json({ success: false, message: "סל לא נמצא" });

    const userId = new ObjectId(req.user._id);
    const isMember = cart.members.some(
      (m) => m.userId.toString() === userId.toString()
    );
    if (!isMember)
      return res.status(403).json({ success: false, message: "אין הרשאה" });

    const items = [...cart.items];
    const idx = items.findIndex(
      (i) => i.name.toLowerCase() === name.toLowerCase()
    );
    if (idx < 0)
      return res.status(404).json({ success: false, message: "פריט לא נמצא" });

    if (qty !== undefined) items[idx].qty = Math.max(0, Math.round(Number(qty) || 0));
    if (price !== undefined) items[idx].price = price;
    if (items[idx].qty <= 0) items.splice(idx, 1);

    await col().updateOne(
      { _id: new ObjectId(id) },
      { $set: { items, updatedAt: new Date() } }
    );

    res.status(200).json({ success: true, items });
  } catch (err) {
    console.error("updateSharedCartItem error:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};

// ── DELETE /api/shared-carts/:id/items/:name ─────────────
export const removeSharedCartItem = async (req, res) => {
  try {
    const { id, name } = req.params;

    const cart = await col().findOne({ _id: new ObjectId(id) });
    if (!cart)
      return res.status(404).json({ success: false, message: "סל לא נמצא" });

    const userId = new ObjectId(req.user._id);
    const isMember = cart.members.some(
      (m) => m.userId.toString() === userId.toString()
    );
    if (!isMember)
      return res.status(403).json({ success: false, message: "אין הרשאה" });

    const items = cart.items.filter(
      (i) => i.name.toLowerCase() !== name.toLowerCase()
    );

    await col().updateOne(
      { _id: new ObjectId(id) },
      { $set: { items, updatedAt: new Date() } }
    );

    res.status(200).json({ success: true, items });
  } catch (err) {
    console.error("removeSharedCartItem error:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};

// ── DELETE /api/shared-carts/:id/leave ───────────────────
// עזיבת סל (לא בעלים)
export const leaveSharedCart = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = new ObjectId(req.user._id);

    const cart = await col().findOne({ _id: new ObjectId(id) });
    if (!cart)
      return res.status(404).json({ success: false, message: "סל לא נמצא" });

    if (cart.ownerId.toString() === userId.toString())
      return res.status(400).json({ success: false, message: "הבעלים לא יכול לעזוב — מחק את הסל במקום" });

    await col().updateOne(
      { _id: new ObjectId(id) },
      {
        $pull: { members: { userId } },
        $set: { updatedAt: new Date() },
      }
    );

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("leaveSharedCart error:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};

// ── DELETE /api/shared-carts/:id ─────────────────────────
// מחיקת סל (בעלים בלבד)
export const deleteSharedCart = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = new ObjectId(req.user._id);

    const cart = await col().findOne({ _id: new ObjectId(id) });
    if (!cart)
      return res.status(404).json({ success: false, message: "סל לא נמצא" });

    if (cart.ownerId.toString() !== userId.toString())
      return res.status(403).json({ success: false, message: "רק הבעלים יכול למחוק את הסל" });

    await col().deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("deleteSharedCart error:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};
