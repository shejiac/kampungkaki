// controllers/requestcontroller.js
import { getAllPastRequests } from "../helpers/pwd/getAllPreviousRequests.ts";
import { upsertCreatedRequest } from "../helpers/pwd/upsertCreatedRequest.ts";

const DEFAULT_USER_ID = "1b4e28ba-2fa1-11d2-883f-0016d3cca427";

// Map incoming UI/body -> RequestInfo (your domain)
function toRequestInfo(body = {}, existing = {}) {
  return {
    request_id: existing.request_id,

    // prefer explicit body.userId; fall back to default
    requester_id: existing.requester_id ?? body.userId ?? DEFAULT_USER_ID,
    volunteer_id: existing.volunteer_id,

    request_title: body.title ?? existing.request_title ?? "",
    request_type: body.type ?? existing.request_type ?? "",
    request_description:
      body.request_description ?? body.description ?? existing.request_description ?? "",
    request_location: body.location ?? existing.request_location ?? "",
    request_initial_meet:
      typeof body.initialMeet === "boolean"
        ? body.initialMeet
        : existing.request_initial_meet ?? false,
    request_time: body.time ?? existing.request_time ?? "",
    request_approx_duration:
      body.approxDuration ??
      body.duration ??
      existing.request_approx_duration ??
      "",
    request_priority: body.priority ?? body.urgency ?? existing.request_priority ?? "",

    request_status: body.status ?? existing.request_status ?? "OPEN",
    created_at: existing.created_at,
    updated_at: existing.updated_at,
  };
}

// Optional: map domain -> UI shape expected by RequestList.jsx
function toUiRow(r) {
  return {
    id: r.request_id,
    userId: r.requester_id,
    title: r.request_title,
    description: r.request_description,
    type: r.request_type,
    location: r.request_location,
    initialMeet: r.request_initial_meet,
    time: r.request_time,
    approxDuration: r.request_approx_duration,
    priority: r.request_priority,
    status: r.request_status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// POST /api/requests
export const createRequest = async (req, res) => {
  try {
    const { title } = req.body || {};
    if (!title) return res.status(400).json({ error: "Title is required" });

    const requestInfo = toRequestInfo(req.body);
    const ok = await upsertCreatedRequest(requestInfo);
    if (!ok) return res.status(500).json({ error: "Failed to save request" });

    // If your helper returns the created entity, you can return it; otherwise:
    return res.status(201).json({ success: true });
  } catch (err) {
    console.error("createRequest error:", err);
    return res.status(500).json({ error: "Failed to save request" });
  }
};

// GET /api/requests?userId=...&q=...&status=...
export const viewRequests = async (req, res) => {
  try {
    const userId = String(req.query.userId || DEFAULT_USER_ID);
    const q = String(req.query.q || "").trim().toLowerCase();
    const status = String(req.query.status || "").trim().toUpperCase();

    let list = await getAllPastRequests(userId);

    if (q) {
      list = list.filter(
        (r) =>
          (r.request_title || "").toLowerCase().includes(q) ||
          (r.request_description || "").toLowerCase().includes(q)
      );
    }

    if (status) {
      list = list.filter((r) => (r.request_status || "").toUpperCase() === status);
    }

    list.sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at).getTime() : 0;
      return db - da; // newest first
    });

    return res.json(list.slice(0, 50).map(toUiRow));
  } catch (err) {
    console.error("viewRequests error:", err);
    return res.status(500).json({ error: "Failed to fetch requests" });
  }
};

// POST /api/requests/:id/accept?userId=...
export const acceptRequest = async (req, res) => {
  try {
    const id = String(req.params.id);
    const userId = String(req.query.userId || DEFAULT_USER_ID);

    const all = await getAllPastRequests(userId);
    const existing = all.find((r) => r.request_id === id);
    if (!existing) return res.status(404).json({ error: "Request not found" });
    if (existing.requester_id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updated = { ...existing, request_status: "ACCEPTED" };
    const ok = await upsertCreatedRequest(updated);
    if (!ok) return res.status(500).json({ error: "Failed to accept request" });

    return res.json(toUiRow(updated));
  } catch (err) {
    console.error("acceptRequest error:", err);
    return res.status(500).json({ error: "Failed to accept request" });
  }
};
