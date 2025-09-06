import { Router, Request, Response } from "express";

const router = Router();

/**
 * GET /api/auth/status
 * Returns whether auth is enforced on the server.
 */
router.get("/status", (_req: Request, res: Response) => {
  res.json({ authRequired: false });  // No authentication required anymore
});

/**
 * GET /api/auth/me
 * Since we're not using Firebase or any authentication, we'll return mock data.
 */
router.get("/me", (_req: Request, res: Response) => {
  // If you need to get data from your database or elsewhere, replace this mock data
  return res.json({
    phone: "+6500000000",  // Mock phone number, replace with real data if needed
    fullName: "John Doe", // Add other fields as necessary
  });
});

/**
 * POST /api/auth/logout
 * Just a placeholder; frontends will clear their tokens or session on logout.
 */
router.post("/logout", (_req: Request, res: Response) => {
  // No actual logout logic needed if there's no Firebase; frontends should clear tokens themselves
  res.json({ ok: true });
});

export default router;
