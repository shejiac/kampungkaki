import { Router, Request as ExpressRequest, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import { upsertCreatedRequest } from "../helpers/pwd/upsertCreatedRequest";
import { RequestInfo } from "../types/request";
import { getAllPastRequests } from "../helpers/pwd/getAllPreviousRequests";
import { pool } from "../config/database";

const router = Router();

// Hardcoded default user ID (existing behavior preserved)
const defaultUserId = "u1";

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
    status: r.request_status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// ---------- helpers ----------
const nn = <T = any>(v: T): T | null => {
  if (v === undefined || v === null) return null;
  if (typeof v === "string" && v.trim() === "") return null;
  return v;
};

// --------------- Incoming payload ---------------
type RequestBody = {
  // accept both shapes from FE
  title?: string;
  request_title?: string;

  type?: string;
  request_type?: string;

  description?: string;
  request_description?: string;

  location?: string;
  request_location?: string;

  initialMeet?: boolean;
  request_initial_meet?: boolean;

  time?: string;                 // ISO string or ""
  request_time?: string;

  approxDuration?: string;       // interval-like or ""
  request_approx_duration?: string;

  priority?: string;
  request_priority?: string;

  status?:  "OPEN" | "ONGOING" | "CLOSED" ;
  request_status?: "OPEN" | "ONGOING" | "CLOSED" ;
};

// Map REST payload -> RequestInfo (domain shape)
function toRequestInfo(body: RequestBody, existing?: Partial<RequestInfo>): RequestInfo {
  // prefer explicit fields, then existing, then null (not "")
  const request_title =
    nn(body.title ?? body.request_title) ??
    nn(existing?.request_title) ??
    null;

  const request_type =
    nn(body.type ?? body.request_type) ??
    nn(existing?.request_type) ??
    null;

  const request_description =
    nn(body.description ?? body.request_description) ??
    nn(existing?.request_description) ??
    null;

  const request_location =
    nn(body.location ?? body.request_location) ??
    nn(existing?.request_location) ??
    null;

  const request_initial_meet =
    (body.initialMeet ?? body.request_initial_meet ??
      existing?.request_initial_meet ?? false) as boolean;

  const request_time =
    nn(body.time ?? body.request_time) ??
    nn(existing?.request_time) ??
    null;

  const request_approx_duration =
    nn(body.approxDuration ?? body.request_approx_duration) ??
    nn(existing?.request_approx_duration) ??
    null;

  const request_priority =
    nn(body.priority ?? body.request_priority) ??
    nn(existing?.request_priority) ??
    null;

  const request_status =
    (nn(body.status ?? body.request_status) ??
      existing?.request_status ??
      "OPEN") as RequestInfo["request_status"];

  return {
    // generate a new id for create; preserve on update
    request_id: existing?.request_id ?? uuidv4(),
    requester_id: existing?.requester_id ?? defaultUserId,
    volunteer_id: existing?.volunteer_id ?? null,

    request_title,
    request_type,
    request_description,
    request_location,
    request_initial_meet,
    request_time,               // null if blank
    request_approx_duration,    // null if blank (avoids ''::interval)
    request_priority,
    request_status,

    created_at: existing?.created_at ?? null,
    updated_at: existing?.updated_at ?? null,
  } as RequestInfo;
}

// -------------------- POST /api/requests --------------------
router.post("/", async (req: ExpressRequest<{}, {}, RequestBody>, res: Response) => {
  try {
    const rawTitle = (req.body.title ?? req.body.request_title ?? "").trim();
    if (!rawTitle) return res.status(400).json({ error: "Title is required" });

    const requestInfo = toRequestInfo(req.body);
    const ok = await upsertCreatedRequest(requestInfo);

    if (!ok) return res.status(500).json({ error: "Failed to create request" });

    return res.status(201).json({ success: true, request_id: requestInfo.request_id });
  } catch (err: any) {
    console.error("POST error:", err);
    return res.status(500).json({ error: "Failed to create request" });
  }
});

// -------------------- GET /api/requests --------------------
// -------------------- GET /api/requests --------------------
router.get("/", async (req, res) => {
  try {
    const requesterId = String(req.query.userId || defaultUserId);
    const q = String(req.query.q || "").trim().toLowerCase();

    // simple direct SQL instead of getAllPastRequests()
    const { rows } = await pool.query(
      `
      SELECT
        request_id,
        requester_id,
        volunteer_id,
        request_title,
        request_type,
        request_description,
        request_location,
        request_initial_meet,
        request_time,
        request_approx_duration,
        request_priority,
        request_status,
        created_at,
        updated_at
      FROM kampung_kaki.t_requests
      WHERE requester_id = $1
      ORDER BY created_at DESC
      LIMIT 200
      `,
      [requesterId]
    );

    // client-side q filter (same as before)
    const filtered = q
      ? rows.filter((r) =>
          (r.request_title || "").toLowerCase().includes(q) ||
          (r.request_description || "").toLowerCase().includes(q)
        )
      : rows;

    // map to the UI shape RequestList expects
    const toUiRow = (r: any) => ({
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
    });

    return res.json(filtered.map(toUiRow));
  } catch (err: any) {
    console.error("GET error:", err);
    return res.status(500).json({ error: "Failed to fetch requests" });
  }
});


// -------------------- PUT /api/requests/:id --------------------
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = defaultUserId;

    const rawTitle = (req.body.title ?? req.body.request_title ?? "").trim();
    if (!rawTitle) return res.status(400).json({ error: "Title is required" });

    const all = await getAllPastRequests(requesterId);
    const existing = all.find(r => r.request_id === id);
    if (!existing) return res.status(404).json({ error: "Request not found" });
    if (existing.requester_id !== requesterId) return res.status(403).json({ error: "Unauthorized" });

    const merged = toRequestInfo(req.body, existing);
    const ok = await upsertCreatedRequest(merged);
    if (!ok) return res.status(500).json({ error: "Failed to update request" });

    return res.json(toUiRow(merged));
  } catch (err: any) {
    console.error("PUT error:", err);
    return res.status(500).json({ error: "Failed to update request" });
  }
});

export default router;
