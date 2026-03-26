// controllers/reportsController.js
// ─────────────────────────────────────────────────────────
// דיווחים / משוב מהמשתמש — נשמרים ב-userReports ומגדילים
// reputation.reportsSubmitted (משפיע על דירוג האמון).
// ─────────────────────────────────────────────────────────

import { ObjectId } from "mongodb";
import { getDB } from "../db/client.js";
import { findById, incReputation } from "../models/User.js";
import { toPublicUser } from "../utils/trustScore.js";

const col = () => getDB().collection("userReports");

const ALLOWED_TYPES = [
  "price_wrong",
  "product_missing",
  "app_bug",
  "suggestion",
  "other",
];

const MAX_PER_DAY = 20;
const MAX_MESSAGE = 2000;
const MIN_MESSAGE = 8;

export const ensureReportIndexes = async () => {
  await col().createIndex({ userId: 1, createdAt: -1 });
};

/**
 * POST /api/reports
 * body: { type: string, message: string, context?: string }
 */
export const submitReport = async (req, res) => {
  try {
    const { type, message, context } = req.body;

    if (!type || !ALLOWED_TYPES.includes(type))
      return res.status(400).json({ success: false, message: "סוג דיווח לא תקין" });

    const msg = String(message || "").trim();
    if (msg.length < MIN_MESSAGE)
      return res.status(400).json({
        success: false,
        message: `נא לפרט לפחות ${MIN_MESSAGE} תווים`,
      });
    if (msg.length > MAX_MESSAGE)
      return res.status(400).json({ success: false, message: "ההודעה ארוכה מדי" });

    const userId = new ObjectId(req.user._id);
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const todayCount = await col().countDocuments({
      userId,
      createdAt: { $gte: startOfDay },
    });
    if (todayCount >= MAX_PER_DAY)
      return res.status(429).json({
        success: false,
        message: "הגעת למגבלת דיווחים יומית — נסה שוב מחר",
      });

    await col().insertOne({
      userId,
      type,
      message: msg,
      context: typeof context === "string" ? context.slice(0, 500) : "",
      createdAt: new Date(),
    });

    await incReputation(req.user._id.toString(), "reportsSubmitted");
    const user = await findById(req.user._id.toString());

    res.status(201).json({ success: true, user: toPublicUser(user) });
  } catch (err) {
    console.error("submitReport error:", err);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};
