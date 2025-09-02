import { Router } from "express";
import { loginUser, getProfile } from "../controllers/authController.js";
const router = Router();

router.post("/login", loginUser);
router.get("/profile", getProfile);

export default router;
