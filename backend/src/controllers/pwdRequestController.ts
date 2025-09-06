// src/controllers/pwdRequestController.ts
import { Request, Response } from "express";
import { getAllPastRequests } from "../helpers/pwd/getAllPreviousRequests";
import { upsertCreatedRequest } from "../helpers/pwd/upsertCreatedRequest";
import type { RequestInfo, RequestStatus } from "../types/request";

type RequestBody = {
  userId?: string;
  title?: string;
  type?: string;
  description?: string;
  location?: string;
  initialMeet?: boolean;
  time?: string;
  approxDuration?: string;
  duration?: string;   // legacy alias
  priority?: string;
  urgency?: string;    // legacy alias
  status?: string;     // free-form; we coerce
};

const DEFAULT_USER_ID = "1b4e28ba-2fa1-11d2-883f-0016d3cca427";

// TitleCase canonical statuses from your types
const CANON: ReadonlyArray<RequestStatus> = ["Open", "Ongoing", "Closed"] as const;

/** Normalize arbitrary input to one of 'Open' | 'Ongoing' | 'Closed'. */
function coerceStatus(input: unknown, fallback: RequestStatus = "Open"): RequestStatus {
  const raw = String(input ?? "").trim().toLowerCase();

  // common synonyms
  if (raw === "accepted" || raw === "in_progress" || raw === "in-progress" || raw === "ongoing")
    return "Ongoing";
  if (raw === "closed" || raw === "done" || raw === "completed" || raw === "cancelled" || raw === "canceled")
    return "Closed";
  if (raw === "open" || raw === "pending" || raw === "new")
    return "Open";

  // unknown → fallback
  return fallback;
}

/** Build a RequestInfo from body + existing, matching central type exactly */
function toRequestInfo(body: RequestBody = {}, existing: Partial<RequestInfo> = {}): RequestInfo {
  return {
    request_id: existing.request_id,
    requester_id: existing.requester_id ?? body.userId ?? DEFAULT_USER_ID,
    // your type is `volunteer_id?: string` → use undefined, not null
    volunteer_id: existing.volunteer_id ?? undefined,

    request_title: body.title ?? existing.request_title ?? "",
    request_type: body.type ?? existing.request_type ?? "",
    request_description:
      body.description ??
      (body as any).request_description ??
      existing.request_description ??
      "",
    request_location: body.location ?? existing.request_location ?? "",

    request_initial_meet:
      typeof body.initialMeet === "boolean"
        ? body.initialMeet
        : (existing.request_initial_meet ?? false),

    request_time: body.time ?? existing.request_time ?? "",
    request_approx_duration:
      body.approxDuration ??
      body.duration ??
      existing.request_approx_duration ??
      "",

    request_priority: body.priority ?? body.urgency ?? existing.request_priority ?? "",
    request_status: coerceStatus(body.status ?? existing.request_status, existing.request_status ?? "Open"),
    created_at: existing.created_at,
    updated_at: existing.updated_at,
  };
}

/** Map domain → UI row */
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

// ------------------- POST /api/requests -------------------
export const createRequest = async (req: Request, res: Response) => {
  try {
    const body = req.body as RequestBody;
    if (!body?.title) return res.status(400).json({ error: "Title is required" });

    const requestInfo = toRequestInfo(body);
    const ok = await upsertCreatedRequest(requestInfo);
    if (!ok) return res.status(500).json({ error: "Failed to save request" });

    return res.status(201).json({ success: true });
  } catch (err) {
    console.error("createRequest error:", err);
    return res.status(500).json({ error: "Failed to save request" });
  }
};

// ------------------- GET /api/requests --------------------
export const viewRequests = async (req: Request, res: Response) => {
  try {
    const userId = String((req.query.userId as string) || DEFAULT_USER_ID);
    const q = String((req.query.q as string) || "").trim().toLowerCase();
    const statusQuery = String((req.query.status as string) || "").trim();

    let list = (await getAllPastRequests(userId)) as RequestInfo[];

    if (q) {
      list = list.filter(
        (r) =>
          (r.request_title || "").toLowerCase().includes(q) ||
          (r.request_description || "").toLowerCase().includes(q)
      );
    }

    if (statusQuery) {
      const normalized = coerceStatus(statusQuery);
      list = list.filter((r) => r.request_status === normalized);
    }

    list.sort((a, b) => {
      const da = a.created_at ? new Date(a.created_at as any).getTime() : 0;
      const db = b.created_at ? new Date(b.created_at as any).getTime() : 0;
      return db - da;
    });

    return res.json(list.slice(0, 50).map(toUiRow));
  } catch (err) {
    console.error("viewRequests error:", err);
    return res.status(500).json({ error: "Failed to fetch requests" });
  }
};

// ------------- POST /api/requests/:id/accept --------------
export const acceptRequest = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const userId = String((req.query.userId as string) || DEFAULT_USER_ID);

    const all = (await getAllPastRequests(userId)) as RequestInfo[];
    const existing = all.find((r) => r.request_id === id);
    if (!existing) return res.status(404).json({ error: "Request not found" });
    if (existing.requester_id !== userId) return res.status(403).json({ error: "Unauthorized" });

    // Move to 'Ongoing' (your valid status)
    const updated: RequestInfo = { ...existing, request_status: "Ongoing" };
    const ok = await upsertCreatedRequest(updated);
    if (!ok) return res.status(500).json({ error: "Failed to accept request" });

    return res.json(toUiRow(updated));
  } catch (err) {
    console.error("acceptRequest error:", err);
    return res.status(500).json({ error: "Failed to accept request" });
  }
};
