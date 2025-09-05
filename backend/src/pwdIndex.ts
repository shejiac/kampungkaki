import "dotenv/config";
import express from "express";
import cors from "cors";
import requests from "./routes/pwdRequests";

const app = express();
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.use("/api/requests", requests);


const port = Number(process.env.PORT || 5000);
app.listen(port, () => console.log(`API listening on :${port}`));
