import { Router } from "express";
import { createRequest, viewRequests, acceptRequest } from "../controllers/requestController.js";
const router = Router();

// PWDs - write req (draft) / post req
router.post("/", createRequest);

// view all reqs + filtering
router.get("/", viewRequests);

// accept req
router.post("/:id/accept", acceptRequest);

export default router;
