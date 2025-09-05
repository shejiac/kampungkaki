import { Router, Request as ExpressRequest, Response } from "express";
// Keep Prisma only for GET for now (unless you have read helpers too)

import { upsertCreatedRequest } from "../helpers/pwd/upsertCreatedRequest"; // <-- update the path
import { RequestInfo } from "../types/request";                // <-- update the path
// add this near your other imports (update the path if your helper lives elsewhere)
import { getAllPastRequests } from "../helpers/pwd/getAllPreviousRequests"; // <-- update path if needed


const router = Router();

// Hardcoded default user ID (existing behavior preserved)
const defaultUserId = "1b4e28ba-2fa1-11d2-883f-0016d3cca427";

function toUiRow(r: RequestInfo) {
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
    status: r.request_status,           // UI shows a badge if present
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}


// --------------- Type Helpers for incoming payload ---------------
type RequestBody = {
  title: string;
  type?: string;
  description?: string;
  location?: string;
  initialMeet?: boolean;
  time?: string;
  approxDuration?: string;
  priority?: string;
  status?: "PENDING" | "OPEN" | "ACCEPTED" | "COMPLETED" | "CANCELLED"; // optional; map to RequestStatus
};

// Utility: map REST payload -> RequestInfo (your domain shape)
function toRequestInfo(body: RequestBody, existing?: Partial<RequestInfo>): RequestInfo {
  return {
    // if caller is updating, let request_id pass through from existing
    request_id: existing?.request_id,
    requester_id: existing?.requester_id ?? defaultUserId,
    volunteer_id: existing?.volunteer_id, // not provided by this payload

    request_title: body.title,
    request_type: body.type ?? (existing?.request_type ?? ""),
    request_description: body.description ?? (existing?.request_description ?? ""),
    request_location: body.location ?? (existing?.request_location ?? ""),
    request_initial_meet: body.initialMeet ?? (existing?.request_initial_meet ?? false),
    request_time: body.time ?? (existing?.request_time ?? ""),
    request_approx_duration: body.approxDuration ?? (existing?.request_approx_duration ?? ""),
    request_priority: body.priority ?? (existing?.request_priority ?? ""),

    // Default or keep existing status if caller didn’t supply one
    request_status: (body.status ?? existing?.request_status ?? "PENDING") as any,
    created_at: existing?.created_at,
    updated_at: existing?.updated_at,
  };
}

// -------------------- POST /api/requests --------------------
router.post(
  "/",
  async (req: ExpressRequest<{}, {}, RequestBody>, res: Response) => {
    try {
      const { title } = req.body;
      if (!title) return res.status(400).json({ error: "Title is required" });

      // Build RequestInfo and upsert via helper
      const requestInfo = toRequestInfo(req.body);
      const ok = await upsertCreatedRequest(requestInfo);

      if (!ok) {
        return res.status(500).json({ error: "Failed to create request" });
      }

      // If you still want to return the newly created entity, you’ll need
      // your helper to return it, or re-fetch by some key (e.g., request_id).
      // For now, just acknowledge success.
      return res.status(201).json({ success: true });
    } catch (err: any) {
      console.error("POST error:", err);
      return res.status(500).json({ error: "Failed to create request" });
    }
  }
);

// -------------------- GET /api/requests --------------------
router.get("/", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim().toLowerCase();
    const requesterId = String(req.query.userId || defaultUserId);

    const all = await getAllPastRequests(requesterId);
    const filtered = q
      ? all.filter(r =>
          (r.request_title || "").toLowerCase().includes(q) ||
          (r.request_description || "").toLowerCase().includes(q)
        )
      : all;

    const sorted = filtered.sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at).getTime() : 0;
      return db - da;
    });

    // return the shape that RequestList reads
    return res.json(sorted.slice(0, 50).map(toUiRow));
  } catch (err: any) {
    console.error("GET error:", err);
    return res.status(500).json({ error: "Failed to fetch requests" });
  }
});


// -------------------- PUT /api/requests/:id --------------------
// -------------------- PUT /api/requests/:id --------------------
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = defaultUserId; // or derive from auth/session

    if (!req.body.title) return res.status(400).json({ error: "Title is required" });

    // get user's requests, then find the one to update
    const all = await getAllPastRequests(requesterId);
    const existing = all.find(r => r.request_id === id);
    if (!existing) return res.status(404).json({ error: "Request not found" });
    if (existing.requester_id !== requesterId) return res.status(403).json({ error: "Unauthorized" });

    const merged = toRequestInfo(req.body, existing);
    const ok = await upsertCreatedRequest(merged);
    if (!ok) return res.status(500).json({ error: "Failed to update request" });

    // Optionally return the updated row in UI shape
    return res.json(toUiRow(merged));
  } catch (err: any) {
    console.error("PUT error:", err);
    return res.status(500).json({ error: "Failed to update request" });
  }
});



export default router;
