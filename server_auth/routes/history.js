// routes/history.js
import { Router } from "express";
import { addScanHistory, getScanHistory, deleteScanHistory } from "../controllers/historyController.js";
import { protect } from "../middleware/auth.js";

const router = Router();
router.use(protect);

router.post("/",    addScanHistory);       // POST   /api/history
router.get("/",     getScanHistory);       // GET    /api/history
router.delete("/:id", deleteScanHistory); // DELETE /api/history/:id

export default router;
