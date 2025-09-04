// src/api.js
import { auth } from "./firebase";

const BASE =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") ||
  "https://kkbackend-final.onrender.com"; // fallback

async function authHeaders() {
  const u = auth.currentUser;
  if (!u) return {}; // no token yet
  const token = await u.getIdToken(); // fresh token
  return { Authorization: `Bearer ${token}` };
}

async function http(method, path, body) {
  const headers = {
    "Content-Type": "application/json",
    ...(await authHeaders()),
  };

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Bubble up backend error (e.g. { error: "missing_token" })
    const msg = data?.error || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

/* ----------------------- API surface ----------------------- */

// GET /me  (token is preferred; phone is only a dev fallback)
export async function getMe(phone) {
  // if backend is strict, phone is ignored and token is used
  const q = phone ? `?phone=${encodeURIComponent(phone)}` : "";
  return http("GET", `/me${q}`);
}

// PUT /me  (token identifies the user; phone optional in dev)
export async function updateMe({ phone, fullName, age, address, avatarUrl }) {
  return http("PUT", "/me", {
    phone,       // optional if backend has token
    fullName,
    age,
    address,
    avatarUrl,
  });
}
