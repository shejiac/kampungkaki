import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/auth";
import { AUTH_REQUIRED } from "../config/firebase";

const router = Router();

/**
 * GET /api/auth/status
 * Returns whether auth is enforced on the server.
 */
router.get("/status", (_req: Request, res: Response) => {
  res.json({ authRequired: AUTH_REQUIRED });
});

/**
 * GET /api/auth/me
 * When AUTH_REQUIRED=true, requires a valid session and returns the phone from req.auth.
 * When AUTH_REQUIRED=false (dev mode), returns a mock "signed-in" phone so the app can function.
 */
router.get("/me", AUTH_REQUIRED ? requireAuth : (_req, _res, next) => next(), (req: Request, res: Response) => {
  if (AUTH_REQUIRED) {
    // These fields should be set by your real auth middleware
    const phone =
      req.auth?.phone_number ||
      req.auth?.phoneNumber ||
      null;

    if (!phone) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    return res.json({
      phone,
      // include any other user fields your frontend expects
      // fullName, avatarUrl, etc. if you have them
    });
  }

  // Dev mode (AUTH_REQUIRED=false): return a predictable mock
  return res.json({
    phone: "+6500000000",
  });
});

/**
 * POST /api/auth/logout
 * Frontends commonly just clear tokens; this endpoint is a no-op placeholder.
 * If you wire Firebase Admin, revoke tokens here.
 */
router.post("/logout", (_req: Request, res: Response) => {
  // TODO: revoke refresh tokens via Firebase Admin if you add it
  res.json({ ok: true });
});

export default router;
