import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/db";
import {
  RegisterUserSchema,
  LoginUserSchema,
  UpdateProfileSchema,
} from "../validations/auth.validation";

const JWT_SECRET = process.env.JWT_SECRET || "agrigenius_fallback_secret_key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const generateToken = (user: {
  id: string;
  email: string;
  full_name: string;
  farm_name?: string;
  location_region?: string;
  preferred_units: "METRIC" | "IMPERIAL";
}) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      farmName: user.farm_name,
      locationRegion: user.location_region,
      preferredUnits: user.preferred_units,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = RegisterUserSchema.parse(req.body);

    // Check if user already exists
    const existing = await query("SELECT id FROM users WHERE email = $1", [
      validatedData.email.toLowerCase(),
    ]);

    if (existing.rowCount > 0) {
      res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
      });
      return;
    }

    // Hash password with 12 salt rounds
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    const result = await query(
      `INSERT INTO users (email, password_hash, full_name, farm_name, location_region, preferred_units)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, full_name, farm_name, location_region, preferred_units, created_at`,
      [
        validatedData.email.toLowerCase(),
        passwordHash,
        validatedData.fullName,
        validatedData.farmName || null,
        validatedData.locationRegion || null,
        validatedData.preferredUnits,
      ]
    );

    const newUser = result.rows[0];
    const token = generateToken(newUser);

    // Set secure HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      success: true,
      message: "Registration successful.",
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        fullName: newUser.full_name,
        farmName: newUser.farm_name,
        locationRegion: newUser.location_region,
        preferredUnits: newUser.preferred_units,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validatedData = LoginUserSchema.parse(req.body);

    const result = await query(
      "SELECT * FROM users WHERE email = $1",
      [validatedData.email.toLowerCase()]
    );

    if (result.rowCount === 0) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(validatedData.password, user.password_hash);

    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
      return;
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        farmName: user.farm_name,
        locationRegion: user.location_region,
        preferredUnits: user.preferred_units,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
  });
  res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthenticated" });
      return;
    }

    const result = await query(
      "SELECT id, email, full_name, farm_name, location_region, preferred_units, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ success: false, message: "User profile not found." });
      return;
    }

    const u = result.rows[0];
    res.status(200).json({
      success: true,
      user: {
        id: u.id,
        email: u.email,
        fullName: u.full_name,
        farmName: u.farm_name,
        locationRegion: u.location_region,
        preferredUnits: u.preferred_units,
        createdAt: u.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthenticated" });
      return;
    }

    const validated = UpdateProfileSchema.parse(req.body);

    const updateFields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (validated.fullName !== undefined) {
      updateFields.push(`full_name = $${idx++}`);
      values.push(validated.fullName);
    }
    if (validated.farmName !== undefined) {
      updateFields.push(`farm_name = $${idx++}`);
      values.push(validated.farmName);
    }
    if (validated.locationRegion !== undefined) {
      updateFields.push(`location_region = $${idx++}`);
      values.push(validated.locationRegion);
    }
    if (validated.preferredUnits !== undefined) {
      updateFields.push(`preferred_units = $${idx++}`);
      values.push(validated.preferredUnits);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ success: false, message: "No update parameters provided." });
      return;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(req.user.id);

    const sql = `UPDATE users SET ${updateFields.join(", ")} WHERE id = $${idx} RETURNING id, email, full_name, farm_name, location_region, preferred_units`;
    const result = await query(sql, values);

    const updatedUser = result.rows[0];
    const newToken = generateToken(updatedUser);

    res.cookie("token", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Farm profile updated successfully.",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        fullName: updatedUser.full_name,
        farmName: updatedUser.farm_name,
        locationRegion: updatedUser.location_region,
        preferredUnits: updatedUser.preferred_units,
      },
      token: newToken,
    });
  } catch (err) {
    next(err);
  }
};
