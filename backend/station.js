import { Router } from "express";
import { requireAuth } from "./auth.js";
import {
  getStationSnapshot,
  getEnergySeries,
  getPredictions,
  getBatteryDetail,
  getRenewableDetail,
  getLoads,
  getEmergencyStatus,
  getDigitalTwin,
  getReports,
  getSettings,
  updateSettings,
} from "../data/simulate.js";

const router = Router();
router.use(requireAuth);

// In-memory load state so toggles persist for the session.
let loadState = null;
function ensureLoads() {
  if (!loadState) loadState = getLoads();
  return loadState;
}

router.get("/dashboard", (req, res) => {
  const snapshot = getStationSnapshot();
  const predictions = getPredictions();
  res.json({
    snapshot,
    ai_status: {
      risk: predictions.risk,
      predicted_consumption_kw: predictions.predicted_demand_kw,
      predicted_generation_kw: predictions.predicted_generation_kw,
      next_6h_safe: predictions.risk !== "high",
    },
    series: getEnergySeries("24h"),
  });
});

router.get("/energy", (req, res) => {
  const range = req.query.range || "24h";
  const snapshot = getStationSnapshot();
  res.json({
    range,
    generation_breakdown: snapshot.generation_breakdown,
    consumption_breakdown: snapshot.consumption_breakdown,
    series: getEnergySeries(range),
  });
});

router.get("/predictions", (req, res) => {
  res.json(getPredictions());
});

router.get("/battery", (req, res) => {
  res.json(getBatteryDetail());
});

router.get("/renewable", (req, res) => {
  res.json(getRenewableDetail());
});

router.get("/loads", (req, res) => {
  res.json({ loads: ensureLoads() });
});

router.post("/loads/:id/toggle", (req, res) => {
  const loads = ensureLoads();
  const load = loads.find((l) => l.id === req.params.id);
  if (!load) return res.status(404).json({ error: "Load not found." });

  const order = ["off", "standby", "on"];
  const idx = order.indexOf(load.status);
  load.status = order[(idx + 1) % order.length];

  res.json({ load });
});

router.get("/emergency", (req, res) => {
  res.json(getEmergencyStatus());
});

router.get("/twin", (req, res) => {
  res.json(getDigitalTwin());
});

router.get("/reports", (req, res) => {
  const period = req.query.period || "daily";
  res.json(getReports(period));
});

router.get("/settings", (req, res) => {
  res.json(getSettings());
});

router.put("/settings", (req, res) => {
  res.json(updateSettings(req.body || {}));
});

export default router;
