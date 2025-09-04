import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import requestRoutes from "./routes/requests.js";

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/requests", requestRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server running on http://localhost:");
});
