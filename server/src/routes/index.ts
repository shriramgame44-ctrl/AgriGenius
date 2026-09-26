import { Router } from "express";
import authRoutes from "./auth.routes";
import advisoryRoutes from "./advisory.routes";
import resourceRoutes from "./resource.routes";
import storeRoutes from "./store.routes";
import marketplaceRoutes from "./marketplace.routes";
import weatherRoutes from "./weather.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/advisory", advisoryRoutes);
router.use("/resources", resourceRoutes);
router.use("/store", storeRoutes);
router.use("/marketplace", marketplaceRoutes);
router.use("/weather", weatherRoutes);

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "AgriGenius API Server",
    timestamp: new Date().toISOString(),
    geminiConfigured: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "AIzaSyYourGeminiApiKeyHere"),
  });
});

export default router;
