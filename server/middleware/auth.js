// middleware/auth.js
// ─────────────────────────────────────────────────────────
// Middleware שמגן על routes פרטיים.
// בודק שה-JWT תקין ושהמשתמש עדיין קיים ב-DB.
// מוסיף את req.user לבקשה כדי שה-controller יוכל להשתמש בו.
// ─────────────────────────────────────────────────────────

import jwt from "jsonwebtoken";
import { findById } from "../models/User.js";

/**
 * protect — יש לצרף כ-middleware לכל route שדורש התחברות.
 *
 * ציפייה לheader: Authorization: Bearer <token>
 */
export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // בדיקה שה-header קיים ובפורמט הנכון
    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ success: false, message: "לא מחובר" });

    const token = authHeader.split(" ")[1];

    // פענוח ואימות ה-token — יזרוק שגיאה אם פג תוקף או לא תקין
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // וידוא שהמשתמש עדיין קיים ב-DB (יכול להימחק אחרי הנפקת ה-token)
    const user = await findById(decoded.id);
    if (!user)
      return res.status(401).json({ success: false, message: "משתמש לא קיים" });

    req.user = user; // מעביר את המשתמש הלאה ל-controller
    next();
  } catch {
    return res.status(401).json({ success: false, message: "טוקן לא תקין" });
  }
};