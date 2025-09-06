// Tiny API client used by App.jsx
const API = import.meta.env.VITE_API_ORIGIN || "http://localhost:5000";
export { API };

/** GET /api/users/me?phone=... -> { phone, fullName, age, address, avatarUrl? } or 204 */
export async function getMe(phone) {
  const url = new URL("/api/users/me", API);
  url.searchParams.set("phone", String(phone || ""));
  const resp = await fetch(url.toString());

  if (resp.status === 204) return null; // no profile yet
  if (!resp.ok) {
    let msg = `Failed to fetch profile (${resp.status})`;
    try {
      const data = await resp.json();
      if (data?.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }
  return resp.json();
}

/** PUT /api/users/me with { phone, fullName, age, address, avatarUrl } -> updated profile JSON */
export async function updateMe(profile) {
  const resp = await fetch(`${API}/api/users/me`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile || {}),
  });

  if (!resp.ok) {
    let msg = `Failed to update profile (${resp.status})`;
    try {
      const data = await resp.json();
      if (data?.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }
  // Some backends may return 204; normalize to object
  if (resp.status === 204) return profile;
  return resp.json();
}
