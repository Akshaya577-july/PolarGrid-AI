import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.js";
import stationRouter from "./routes/station.js";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "polargrid-backend", time: Date.now() });
});

app.use("/api/auth", authRouter);
app.use("/api", stationRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found." });
});

app.listen(PORT, () => {
  console.log(`PolarGrid AI backend listening on http://localhost:${PORT}`);
});
