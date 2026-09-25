import rateLimit from "express-rate-limit";

// Rate limiter for AI advisory endpoints: max 10 requests per 1 minute
export const advisoryRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many advisory requests from this client. Please slow down and try again after a minute.",
  },
});

// General API rate limiter: max 100 requests per 15 minutes
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Request limit exceeded. Please try again later.",
  },
});
