import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  farmName?: string;
  locationRegion?: string;
  preferredUnits: "METRIC" | "IMPERIAL";
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Check Authorization header or cookies
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Authentication required. Please log in.",
      });
      return;
    }

    const secret = process.env.JWT_SECRET || "agrigenius_fallback_secret_key";
    const decoded = jwt.verify(token, secret) as AuthenticatedUser;

    req.user = decoded;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired session token.",
    });
  }
};
