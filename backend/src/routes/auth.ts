import { Router, Request, Response } from "express";

const router = Router();

/**
 * GET /api/auth/status
 * Returns whether auth is enforced on the server.
 */
router.get("/status", (_req: Request, res: Response) => {
  res.json({ authRequired: false });  
});

/**
 * GET /api/auth/me
 */
router.get("/me", (_req: Request, res: Response) => {
  return res.json({
    phone: "+6500000000",  
    fullName: "John Doe", 
  });
});

/**
 * POST /api/auth/logout
 */
router.post("/logout", (_req: Request, res: Response) => {
  res.json({ ok: true });
});

export default router;
