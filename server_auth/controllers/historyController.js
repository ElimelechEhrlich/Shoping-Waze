// controllers/historyController.js
// שמירה וקריאה של היסטוריית סריקות קבלות
// ─────────────────────────────────────────────────────────

import { getDB } from "../db/client.js";
import { ObjectId } from "mongodb";

const col = () => getDB().collection("scanHistory");

// ── POST /api/history ─────────────────────────────────────
// נשמר אחרי שהמשתמש מאשר קבלה ב-ReceiptDetailsPage
export const addScanHistory = async (req, res) => {
  try {
    const { storeName, items, total } = req.body;
    if (!items?.length)
      return res.status(400).json({ success: false, message: "אין פריטים" });

    const userId = new ObjectId(req.user._id);
    const entry = {
      userId,
      storeName: storeName || "לא ידוע",
      items,
      total:     typeof total === "number" ? total : 0,
      scannedAt: new Date(),
    };

    const result = await col().insertOne(entry);
    res.status(201).json({ success: true, id: result.insertedId });
  } catch (err) {
    console.error("addScanHistory error:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};

// ── GET /api/history ──────────────────────────────────────
// מחזיר את 50 הסריקות האחרונות של המשתמש
export const getScanHistory = async (req, res) => {
  try {
    const userId = new ObjectId(req.user._id);
    const entries = await col()
      .find({ userId })
      .sort({ scannedAt: -1 })
      .limit(50)
      .toArray();

    res.status(200).json({ success: true, history: entries });
  } catch (err) {
    console.error("getScanHistory error:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};

// ── DELETE /api/history/:id ───────────────────────────────
export const deleteScanHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = new ObjectId(req.user._id);
    const entry  = await col().findOne({ _id: new ObjectId(id) });

    if (!entry)
      return res.status(404).json({ success: false, message: "רשומה לא נמצאה" });
    if (entry.userId.toString() !== userId.toString())
      return res.status(403).json({ success: false, message: "אין הרשאה" });

    await col().deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("deleteScanHistory error:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};
