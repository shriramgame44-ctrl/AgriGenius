import { Router } from "express";
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
} from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authenticateToken, getMe);
router.put("/profile", authenticateToken, updateProfile);

export default router;
