// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import type { DecodedIdToken } from "firebase-admin/auth";
import { admin, AUTH_REQUIRED } from "../config/firebase";

/** ---- Express.Request augmentation so req.auth / req.user are typed ---- */
declare module "express-serve-static-core" {
  interface Request {
    auth?: DecodedIdToken | null;
    user?: {
      uid: string;
      email?: string;
      emailVerified?: boolean;
      name?: string;
      picture?: string;
    };
  }
}

/**
 * requireAuth:
 * - If AUTH_REQUIRED = false, allow through.
 * - Else, require a valid Firebase ID token (Authorization: Bearer <token>).
 * - On success, sets req.auth (DecodedIdToken) and next().
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!AUTH_REQUIRED) return next();

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: "missing_token" });

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.auth = decoded; // contains phone_number if phone auth
    return next();
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("ID token verify failed:", msg);
    return res.status(401).json({ error: "invalid_token" });
  }
}

/**
 * optionalAuth:
 * - If AUTH_REQUIRED = false, sets req.auth = null and continues.
 * - Else, if a Bearer token is present, verifies and sets req.auth; otherwise sets null.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  if (!AUTH_REQUIRED) {
    req.auth = null;
    return next();
  }

  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    req.auth = null;
    return next();
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.auth = decoded;
  } catch {
    req.auth = null; // invalid token → proceed unauthenticated
  }
  return next();
}

/**
 * verifyToken:
 * Example middleware that fills req.user from the decoded token (email/name/picture).
 * Useful if you want /api/auth/me to return these fields easily.
 */
export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: decoded.email_verified,
      name: decoded.name,
      picture: decoded.picture,
    };
    return next();
  } catch (error) {
    const err: any = error; // narrow unknown
    console.error("Token verification failed:", err?.message || err);

    if (err?.code === "auth/id-token-expired") {
      return res.status(401).json({ error: "Token expired" });
    }
    if (err?.code === "auth/argument-error") {
      return res.status(401).json({ error: "Invalid token format" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
}
