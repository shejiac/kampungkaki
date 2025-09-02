import { Router } from "express";
import { startRequest, finishRequest } from "../controllers/chatController.js";
const router = Router();

// start req: generate code OR press start
router.post("/start", startRequest);

// finish req: generate code on PWD side & then volunteer inputs
router.post("/finish", finishRequest);

export default router;
