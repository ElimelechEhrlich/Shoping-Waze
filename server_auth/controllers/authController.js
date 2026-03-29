// controllers/authController.js
// ─────────────────────────────────────────────────────────
// לוגיקת ה-Auth מופרדת מה-routes לצורך clean-code.
// כל פונקציה מטפלת בבקשה אחת בלבד (Single Responsibility).
// ─────────────────────────────────────────────────────────

import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import {
  createUser,
  findByEmail,
  comparePassword,
  updateUserProfile,
  bootstrapReputationIfNeeded,
  upsertUserFromGoogle,
} from "../models/User.js";
import { toPublicUser } from "../utils/trustScore.js";

// ── עזר פנימי ─────────────────────────────────────────────

/**
 * יוצר JWT עם ה-id של המשתמש.
 * התוקף מוגדר ב-.env (ברירת מחדל: 7 ימים).
 */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/**
 * שולח תשובה עם token + פרטי משתמש.
 * משמש גם ב-register וגם ב-login.
 */
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({ success: true, token, user: toPublicUser(user) });
};

// ── Handlers ──────────────────────────────────────────────

/**
 * POST /api/auth/register
 * רישום משתמש חדש.
 * בודק שהאימייל לא קיים ויוצר משתמש עם סל ריק.
 */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ולידציה בסיסית בצד שרת
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "אנא מלא את כל השדות" });

    if (name.trim().length < 2)
      return res.status(400).json({ success: false, message: "שם חייב להכיל לפחות 2 תווים" });

    if (password.length < 6)
      return res.status(400).json({ success: false, message: "סיסמה חייבת להכיל לפחות 6 תווים" });

    // בדיקה שהאימייל לא תפוס
    const existing = await findByEmail(email);
    if (existing)
      return res.status(400).json({ success: false, message: "אימייל כבר קיים במערכת" });

    // יצירת המשתמש — ה-hash נעשה בתוך createUser
    const user = await createUser({ name, email, password });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};

/**
 * POST /api/auth/login
 * התחברות עם אימייל וסיסמה.
 * מחזיר token בהצלחה, שגיאה גנרית בכישלון (אבטחה).
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "אנא מלא אימייל וסיסמה" });

    // includePassword=true כי צריך את ה-hash להשוואה
    const user = await findByEmail(email, true);

    // שגיאה גנרית — לא מגלים למשתמש מה שגוי (אימייל או סיסמה)
    if (!user || !user.password || !(await comparePassword(password, user.password)))
      return res.status(401).json({ success: false, message: "אימייל או סיסמה שגויים" });

    // מסירים את ה-hash לפני שליחה ל-client
    const { password: _removed, ...userWithoutPassword } = user;

    sendTokenResponse(userWithoutPassword, 200, res);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};

/**
 * POST /api/auth/google
 * body: { credential } — JWT (id token) מה-Sign in with Google בצד לקוח.
 */
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential || typeof credential !== "string") {
      return res.status(400).json({ success: false, message: "חסר אסימון Google" });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return res.status(503).json({
        success: false,
        message: "התחברות Google לא מוגדרת בשרת",
      });
    }

    const oAuthClient = new OAuth2Client(clientId);
    const ticket = await oAuthClient.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email) {
      return res.status(401).json({ success: false, message: "לא ניתן לאמת את חשבון Google" });
    }

    if (payload.email_verified !== true) {
      return res.status(401).json({ success: false, message: "יש לאמת את האימייל בחשבון Google" });
    }

    const { user, error } = await upsertUserFromGoogle({
      googleSub: payload.sub,
      email: payload.email,
      name: payload.name || "",
    });

    if (error === "google_email_conflict") {
      return res.status(409).json({
        success: false,
        message: "האימייל כבר משויך לחשבון Google אחר",
      });
    }

    if (!user) {
      return res.status(500).json({ success: false, message: "שגיאת שרת" });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(401).json({ success: false, message: "אימות Google נכשל" });
  }
};

/**
 * GET /api/auth/me
 * מחזיר את המשתמש המחובר (מגיע מ-middleware).
 * משמש ל-persist session בצד client.
 */
export const getMe = async (req, res) => {
  const user = await bootstrapReputationIfNeeded(req.user);
  res.status(200).json({ success: true, user: toPublicUser(user) });
};

/**
 * PUT /api/auth/me
 * מעדכן פרופיל המשתמש המחובר (שם, צבע אווטר).
 */
export const updateProfile = async (req, res) => {
  try {
    const { name, avatarColor } = req.body;

    if (name !== undefined && name.trim().length < 2)
      return res.status(400).json({ success: false, message: "שם חייב להכיל לפחות 2 תווים" });

    const updated = await updateUserProfile(req.user._id.toString(), { name, avatarColor });
    if (!updated)
      return res.status(404).json({ success: false, message: "משתמש לא נמצא" });

    res.status(200).json({ success: true, user: toPublicUser(updated) });
  } catch (error) {
    console.error("UpdateProfile error:", error);
    res.status(500).json({ success: false, message: "שגיאת שרת" });
  }
};