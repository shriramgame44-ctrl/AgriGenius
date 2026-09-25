import { Router } from "express";
import { getSanctuaries } from "../controllers/resource.controller";

const router = Router();

// Public / Authenticated read-only access to sanctuaries directory
router.get("/sanctuaries", getSanctuaries);

export default router;
