// src/index.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import "dotenv/config";
import { randomUUID } from "node:crypto"; // or: from "crypto"


// controllers you already have
import {
  createRequest,
  viewRequests,
  acceptRequest,
} from "./controllers/pwdRequestController";

// history + stats helpers
import { getAllPastRequests } from "./helpers/pwd/getAllPreviousRequests"; 
import {
  getPWDCount,
  getVolunteerCount,
  getRequestCount,
} from "./helpers/profile/getStats"; 

// DB pool for health checks & shutdown
import { pool } from "./config/database";

// ---- Chat/Request helpers (call the concrete helpers directly) ----
import { getChatDetailsByReqId } from "./helpers/chat/getChatsDetails";
import { getRequestsByUserId } from "./helpers/chat/getRequestsByUserId";
import { getChatMessages, getLastChatMessage } from "./helpers/chat/getChatMessages";
import { getRequesterbyRequest } from "./helpers/chat/getRequesterByRequestId";
import { upsertChat } from "./helpers/chat/upsertChat";
import { upsertChatMessage } from "./helpers/chat/upsertChatMessage";
import { upsertAcceptedRequest } from "./helpers/chat/upsertAcceptedRequest";
import { updateStatus } from "./helpers/chat/updateStatus";
import type { Chat } from "./types/chats";
import type { AcceptedRequestInfo } from "./types/request";

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// ---------- middleware ----------
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

// ---------- root test ----------
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "KampungKaki Backend API",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// ---------- requests (existing) ----------
app.post("/api/requests", createRequest);
app.get("/api/requests", viewRequests);

// NOTE: remove/disable auth while Firebase is off
// DO NOT keep: app.use("/api/auth", authRoutes);

// ---------- inbox: list threads for a user ----------
app.get("/api/threads", async (req, res) => {
  try {
    const userId = req.header("X-User-Id");
    if (!userId) return res.status(401).json({ error: "Missing X-User-Id" });

    const requests = await getRequestsByUserId(userId); // RequestInfo[]

    const threads = (
      await Promise.all(
        requests.map(async (r: any) => {
          const requestId: string | undefined = r?.request_id;
          if (!requestId) return null;

          // find chat_id (if chat exists)
          let chatId: string | undefined;
          try {
            const chat = await getChatDetailsByReqId(requestId); // { chat_id, requester_id, volunteer_id, ... }
            chatId = chat?.chat_id;
          } catch {
            chatId = undefined;
          }

          // last message preview
          let last: any = null;
          if (chatId) {
            const msgs = await getChatMessages(chatId);
            last = msgs?.length ? await getLastChatMessage(msgs) : null;
          }

          return {
            id: requestId, // FE treats threadId == request_id
            status: r?.request_status ?? "pending",
            started: Boolean(r?.request_start_time),
            ended: Boolean(r?.request_end_time),
            lastMessageAt: last?.created_at ?? null,
            lastPreview: last?.body ?? "",
            request: { title: r?.title ?? r?.request_title ?? "Request" },
          };
        })
      )
    ).filter(Boolean);

    res.json({ threads });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "threads_failed" });
  }
});

// ---------- thread details: param is request_id ----------
app.get("/api/threads/:threadId", async (req, res) => {
  try {
    const userId = req.header("X-User-Id");
    if (!userId) return res.status(401).json({ error: "Missing X-User-Id" });

    const requestId = req.params.threadId; // we treat threadId as request_id
    const chat = await getChatDetailsByReqId(requestId); // -> { chat_id, requester_id, volunteer_id, ... }
    const chatId = chat?.chat_id;

    const messagesRaw = chatId ? await getChatMessages(chatId) : [];
    const messages = (messagesRaw ?? []).map((m: any) => ({
      id: m.message_id ?? randomUUID(),
      sender_id: m.sender_id ?? null,
      kind: m.message_type === "system" ? "system" : "user",
      body: m.body,
      created_at: m.created_at ?? new Date().toISOString(),
    }));

    res.json({
      thread: { id: requestId, status: "pending" },
      messages,
      session: null,
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "thread_failed" });
  }
});

// ---------- send message: body.threadId is request_id ----------
app.post("/api/messages", async (req, res) => {
  try {
    const userId = req.header("X-User-Id");
    if (!userId) return res.status(401).json({ error: "Missing X-User-Id" });

    const { threadId, body } = req.body || {};
    if (!threadId || typeof body !== "string" || !body.trim()) {
      return res.status(400).json({ error: "Bad body" });
    }

    // map request_id -> chat_id
    const chat = await getChatDetailsByReqId(String(threadId));
    const chatId: string | undefined = chat?.chat_id;
    if (!chatId) return res.status(404).json({ error: "Chat not found for this request" });

    await upsertChatMessage({
      chat_id: chatId,
      sender_id: userId,
      message_type: "user",
      body,
    } as any);

    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "send_failed" });
  }
});

// ---------- accept request: create chat + acceptedRequest, return {threadId} ----------
app.post("/api/requests/:id/accept", async (req: Request, res: Response) => {
  try {
    const volunteerId = req.header("X-User-Id");
    if (!volunteerId) return res.status(401).json({ error: "Missing X-User-Id" });

    const requestId = req.params.id;
    const requesterId = await getRequesterbyRequest(requestId);

    // create/upsert chat row
    const chat: Chat = {
      request_id: requestId,
      requester_id: requesterId,
      volunteer_id: volunteerId,
    };
    await upsertChat(chat);

    // mark request as Ongoing + write acceptedRequest
    await updateStatus(requestId, "Ongoing");

    const accepted: AcceptedRequestInfo = {
      request_id: requestId,
      requester_id: requesterId,
      volunteer_id: volunteerId,
      request_status: "Ongoing",
    };
    await upsertAcceptedRequest(accepted);

    res.json({ threadId: requestId }); // FE opens with request_id
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "accept_failed" });
  }
});

// ---------- start/end: set start/end timestamps on AcceptedRequest ----------
app.post("/api/events/:threadId/start", async (req: Request, res: Response) => {
  try {
    const requestId = req.params.threadId; // request_id
    const chat = await getChatDetailsByReqId(requestId);
    const accepted: AcceptedRequestInfo = {
      request_id: requestId,
      requester_id: chat.requester_id,
      volunteer_id: chat.volunteer_id,
      request_status: "Ongoing",
      request_start_time: new Date(),
    };
    await upsertAcceptedRequest(accepted);
    await updateStatus(requestId, "Ongoing");
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "start_failed" });
  }
});

app.post("/api/events/:threadId/approve-start", async (req: Request, res: Response) => {
  try {
    const requestId = req.params.threadId;
    const chat = await getChatDetailsByReqId(requestId);
    const accepted: AcceptedRequestInfo = {
      request_id: requestId,
      requester_id: chat.requester_id,
      volunteer_id: chat.volunteer_id,
      request_status: "Ongoing",
      request_start_time: new Date(),
    };
    await upsertAcceptedRequest(accepted); // idempotent upsert
    await updateStatus(requestId, "Ongoing");
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "approve_start_failed" });
  }
});

app.post("/api/events/:threadId/request-end", async (_req: Request, res: Response) => {
  // optional: write a system message that volunteer requested to end
  res.json({ ok: true });
});

app.post("/api/events/:threadId/approve-end", async (req: Request, res: Response) => {
  try {
    const requestId = req.params.threadId;
    const chat = await getChatDetailsByReqId(requestId);
    const accepted: AcceptedRequestInfo = {
      request_id: requestId,
      requester_id: chat.requester_id,
      volunteer_id: chat.volunteer_id,
      request_status: "Ongoing",
      request_end_time: new Date(),
    };
    await upsertAcceptedRequest(accepted);
    // (optionally) await updateStatus(requestId, "completed")
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "approve_end_failed" });
  }
});

// ---------- stats (for AnimatedStatsRow) ----------
app.get("/api/stats", async (_req: Request, res: Response) => {
  try {
    const [pwd, vol, reqs] = await Promise.all([
      getPWDCount().catch(() => 0),
      getVolunteerCount().catch(() => 0),
      getRequestCount().catch(() => 0),
    ]);

    // "helped" is not directly in your helper; if you track completed requests, reuse reqs or compute separately.
    res.json({
      volunteers: vol ?? 0,
      requests: reqs ?? 0,
      helped: (reqs ?? 0), // or another counter if you have one
    });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "stats_failed" });
  }
});

// ---------- history (completed / previous requests for a user) ----------
app.get("/api/history", async (req: Request, res: Response) => {
  try {
    const userId = req.header("X-User-Id");
    if (!userId) return res.status(401).json({ error: "Missing X-User-Id" });

    // Most implementations take userId. If your helper returns *all* rows,
    // just filter locally by requester/volunteer === userId (kept below anyway).
    const rows: any[] = await getAllPastRequests(userId);

    const items = (rows || []).map((r) => {
      const id =
        r.request_id ??
        r.id ??
        r.chat_id ??
        String(Math.random()); // last-ditch fallback

      const title = r.title ?? r.request_title ?? "Request";
      const description = r.description ?? r.request_description ?? null;

      const location =
        r.request_location ?? r.location ?? r.address ?? null;

      const endedAt =
        r.request_end_time ??
        r.completed_at ??
        r.ended_at ??
        null;

      const role =
        userId === r.requester_id
          ? "beneficiary"
          : userId === r.volunteer_id
          ? "volunteer"
          : "other";

      return { id, title, description, location, endedAt, role };
    });

    res.json({ items });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || "history_failed" });
  }
});

// ---------- health ----------
app.get("/health", async (_req: Request, res: Response) => {
  try {
    await pool.query("SELECT 1");
    res.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error?.message || String(error),
      timestamp: new Date().toISOString(),
    });
  }
});

// ---------- error handler ----------
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development" ? err?.message || String(err) : "Something went wrong",
  });
});

// ---------- 404 ----------
app.use("*", (req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// ---------- graceful shutdown ----------
async function shutdown() {
  try {
    console.log("Shutting down gracefully...");
    await pool.end();
  } catch (e) {
    console.error("Shutdown error:", e);
  } finally {
    process.exit(0);
  }
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// ---------- start ----------
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`API URL: http://localhost:${PORT}`);
});
