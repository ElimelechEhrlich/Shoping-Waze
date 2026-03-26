// routes/reports.js
// ─────────────────────────────────────────────────────────
import { Router } from "express";
import { submitReport } from "../controllers/reportsController.js";
import { protect } from "../middleware/auth.js";

const router = Router();

router.post("/", protect, submitReport);

export default router;
