import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { initDb } from "./config/db";
import apiRoutes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.middleware";
import { generalRateLimiter } from "./middleware/rateLimit.middleware";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Security & Parsing Middleware
app.use(
  cors({
    origin: [CLIENT_URL, "http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser());

// Apply global rate limiting to all /api routes
app.use("/api", generalRateLimiter);

// Mount API router
app.use("/api", apiRoutes);

// Error Handling Middlewares
app.use(notFoundHandler);
app.use(errorHandler);

// Bootstrap Server & DB
const startServer = async () => {
  try {
    console.log("--------------------------------------------------");
    console.log("🌱 Starting AgriGenius Enterprise Agronomy Server...");
    console.log("--------------------------------------------------");

    await initDb();

    app.listen(PORT, () => {
      console.log(`✅ AgriGenius API server actively listening on port ${PORT}`);
      console.log(`📡 Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
