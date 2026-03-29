// routes/auth.js
// ─────────────────────────────────────────────────────────
// הגדרת ה-routes של Auth בלבד.
// הלוגיקה עצמה נמצאת ב-controllers/authController.js
// ─────────────────────────────────────────────────────────

import { Router } from "express";
import { register, login, googleAuth, getMe, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// ── Public routes ──────────────────────────────────────
router.post("/register", register);       // POST /api/auth/register
router.post("/login", login);             // POST /api/auth/login
router.post("/google", googleAuth);       // POST /api/auth/google

// ── Protected routes (דורשים JWT תקין) ────────────────
router.get("/me",  protect, getMe);       // GET  /api/auth/me
router.put("/me",  protect, updateProfile); // PUT  /api/auth/me  (עדכון פרופיל)

export default router;