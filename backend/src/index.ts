// src/index.ts
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import "dotenv/config";

// side effects (Firebase init)
import "./config/firebase";

// routers/controllers
import authRoutes from "./routes/auth";
import {
  createRequest,
  viewRequests,
  acceptRequest,
} from "./controllers/pwdRequestController";

// DB pool for health checks & shutdown
import { pool } from "./config/database";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// ---------- middleware ----------
app.use(cors());
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
