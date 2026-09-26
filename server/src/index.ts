import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { initDb } from "./config/db";
import apiRoutes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.middleware";
import { generalRateLimiter } from "./middleware/rateLimit.middleware";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// Security & Parsing Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-origin, local network, onrender.com, and mobile requests
      if (!origin || origin.includes("localhost") || origin.includes("onrender.com") || origin === CLIENT_URL) {
        return callback(null, true);
      }
      return callback(null, true);
    },
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

// Serve static frontend files if client/dist exists
const possibleDistPaths = [
  path.resolve(__dirname, "../../client/dist"),
  path.resolve(process.cwd(), "client/dist"),
  path.resolve(process.cwd(), "../client/dist"),
];
const clientDistPath = possibleDistPaths.find((p) => fs.existsSync(p));

if (clientDistPath) {
  console.log(`📦 Serving static client bundle from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // For any non-API route, send index.html (SPA client routing)
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, "index.html"));
  });
}

// Error Handling Middlewares (for unmatched /api routes)
app.use(notFoundHandler);
app.use(errorHandler);

// Bootstrap Server & DB
const startServer = async () => {
  try {
    console.log("--------------------------------------------------");
    console.log("🌱 Starting AgriGenius Enterprise Agronomy Server...");
    console.log("--------------------------------------------------");

    await initDb();

    app.listen(PORT, "0.0.0.0", () => {
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
