import { Router } from "express";
import {
  createCropAdvisory,
  createLivestockAdvisory,
  getUserAdvisories,
  getAdvisoryById,
  deleteAdvisory,
  downloadAdvisoryPdf,
} from "../controllers/advisory.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { advisoryRateLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

// Protect all advisory routes with authentication
router.use(authenticateToken);

// Rate-limited inference routes
router.post("/crop", advisoryRateLimiter, createCropAdvisory);
router.post("/livestock", advisoryRateLimiter, createLivestockAdvisory);

// CRUD and export routes
router.get("/", getUserAdvisories);
router.get("/:id", getAdvisoryById);
router.delete("/:id", deleteAdvisory);
router.get("/:id/pdf", downloadAdvisoryPdf);

export default router;
