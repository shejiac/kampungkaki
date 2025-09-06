// src/index.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import "dotenv/config";

// side effects (Firebase init)
import "./config/firebase";

// routers/controllers
import {
  createRequest,
  viewRequests,
  acceptRequest,
} from "./controllers/pwdRequestController";

// DB pool for health checks & shutdown
import { pool } from "./config/database";

// CHAT HELPERS
import {
  listChatForUser,
  getChat,
  userCreateMessage,
  startTime,
  endTime,
} from "./helpers/chat/mainChatHelpers";
import { getChatDetails } from "./helpers/chat/getChatsDetails"; 
import { getRequestsByUserId } from './helpers/chat/getRequestsByUserId';
import { getChatMessages, getLastChatMessage } from './helpers/chat/getChatMessages';

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// ---------- middleware ----------
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }))
app.use(express.json());

// ---------- root test ----------
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "KampungKaki Backend API",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// ---------- routes ----------
app.use("/api/auth", authRoutes);

app.post("/api/requests", createRequest);
app.get("/api/requests", viewRequests);
app.post("/api/requests/:id/accept", acceptRequest);

// 1) inbox
app.get('/api/threads', async (req, res) => {
  try {
    const userId = req.header('X-User-Id');
    if (!userId) return res.status(401).json({ error: 'Missing X-User-Id' });

    const requests = await getRequestsByUserId(userId); // RequestInfo[]

    const threads = (await Promise.all(
      requests.map(async (r: any) => {
        const requestId: string | undefined = r?.request_id;
        if (!requestId) {
          // skip malformed rows
          return null;
        }

        // try to get chat_id (may not exist yet if not accepted)
        let chatId: string | undefined;
        try {
          const chat = await getChatDetails(requestId); // { chat_id?, ... }
          chatId = chat?.chat_id;
        } catch {
          chatId = undefined;
        }

        // try to fetch last message (only if we have a chatId)
        let last: any = null;
        if (chatId) {
          const msgs = await getChatMessages(chatId);
          last = msgs?.length ? await getLastChatMessage(msgs) : null;
        }

        return {
          id: requestId,                                            // threadId = request_id
          status: r?.request_status ?? 'pending',
          started: Boolean(r?.request_start_time),
          ended:   Boolean(r?.request_end_time),
          lastMessageAt: last?.created_at ?? null,
          lastPreview:   last?.body ?? '',
          request: { title: r?.title ?? r?.request_title ?? 'Request' },
        };
      })
    )).filter(Boolean); // drop nulls

    res.json({ threads });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'threads_failed' });
  }
});

// 2) thread details (treat param as request_id)
app.get('/api/threads/:threadId', async (req, res) => {
  try {
    const userId = req.header('X-User-Id');
    if (!userId) return res.status(401).json({ error: 'Missing X-User-Id' });

    const requestId = req.params.threadId;      // <- request_id
    const data = await getChat(requestId);      // your helper expects request_id
    res.json({
      thread: { id: requestId, status: 'pending' },
      messages: (data.chat_messages ?? []).map((m: any) => ({
        id: m.message_id ?? crypto.randomUUID(),
        sender_id: m.sender_id ?? null,
        kind: m.message_type === 'system' ? 'system' : 'user',
        body: m.body,
        created_at: m.created_at ?? new Date().toISOString(),
      })),
      session: null,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message || 'thread_failed' });
  }
});

// 3) send message (body contains threadId = request_id)
app.post('/api/messages', async (req, res) => {
  try {
    const userId = req.header('X-User-Id');
    if (!userId) return res.status(401).json({ error: 'Missing X-User-Id' });

    const { threadId, body } = req.body || {};
    if (!threadId || typeof body !== 'string' || !body.trim()) {
      return res.status(400).json({ error: 'Bad body' });
    }

    // threadId is request_id in this model
    const chat = await getChatDetails(String(threadId));
    const chatId: string | undefined = chat?.chat_id;
    if (!chatId) {
      return res.status(404).json({ error: 'Chat not found for this request' });
    }

    await userCreateMessage(chatId, userId, body);
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'send_failed' });
  }
});

// 4) start/end session (use request_id; your helpers call getChatDetails inside)
app.post("/api/events/:threadId/start", async (req: Request, res: Response) => {
  try { await startTime(req.params.threadId); res.json({ ok: true }) }
  catch (e: any) { res.status(500).json({ error: e.message || "start_failed" }) }
});
app.post("/api/events/:threadId/approve-start", async (req: Request, res: Response) => {
  try { await startTime(req.params.threadId); res.json({ ok: true }) }
  catch (e: any) { res.status(500).json({ error: e.message || "approve_start_failed" }) }
});
app.post("/api/events/:threadId/request-end", async (_req: Request, res: Response) => {
  res.json({ ok: true });
});
app.post("/api/events/:threadId/approve-end", async (req: Request, res: Response) => {
  try { await endTime(req.params.threadId); res.json({ ok: true }) }
  catch (e: any) { res.status(500).json({ error: e.message || "approve_end_failed" }) }
});

// 5) accept request -> return the request_id as the thread id (consistent with FE)
import { acceptRequest as acceptRequestHelper } from "./helpers/chat/mainChatHelpers";
app.post("/api/requests/:id/accept", async (req: Request, res: Response) => {
  try {
    const volunteerId = req.header("X-User-Id");
    if (!volunteerId) return res.status(401).json({ error: "Missing X-User-Id" });

    await acceptRequestHelper(req.params.id, volunteerId); // creates chat + acceptedRequest
    res.json({ threadId: req.params.id }); // FE will use request_id as thread id
  } catch (e: any) {
    res.status(500).json({ error: e.message || "accept_failed" });
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
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 API URL: http://localhost:${PORT}`);
  console.log(
    `🔥 Firebase Auth: ${process.env.AUTH_REQUIRED !== "false" ? "Enabled" : "Disabled (Dev Mode)"}`
  );
});
