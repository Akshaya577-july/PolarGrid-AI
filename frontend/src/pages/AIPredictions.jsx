import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import LineChart from "../components/LineChart";
import { api } from "../api";

export default function AIPredictions() {
  const [data, setData] = useState(null);
  const [graph, setGraph] = useState("demand");

  useEffect(() => {
    let alive = true;
    api.predictions().then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, []);

  if (!data) {
    return (
      <>
        <Topbar title="AI predictions" subtitle="Forecast-driven energy planning" />
        <div className="loading-state">Running forecast model…</div>
      </>
    );
  }

  const graphs = {
    demand: { label: "Predicted energy demand", series: data.forecast_series.demand, color: "#7FD4F0" },
    generation: { label: "Predicted renewable generation", series: data.forecast_series.generation, color: "#52D9A8" },
    temperature: { label: "Predicted temperature", series: data.forecast_series.temperature, color: "#E8A339" },
  };

  return (
    <>
      <Topbar title="AI predictions" subtitle="Forecast-driven energy planning" />

      <div className="metric-grid">
        <div className="metric-card ice-v">
          <div className="label">Energy demand</div>
          <div className="value">
            {data.predicted_demand_kw} <small>kW</small>
          </div>
          <div className="delta">Next {data.horizon_hours}h</div>
        </div>
        <div className="metric-card aurora-v">
          <div className="label">Renewable generation</div>
          <div className="value">
            {data.predicted_generation_kw} <small>kW</small>
          </div>
          <div className="delta">Next {data.horizon_hours}h</div>
        </div>
        <div className="metric-card">
          <div className="label">Battery trajectory</div>
          <div className="value">
            {data.battery_projection.start_pct}% → {data.battery_projection.end_pct}%
          </div>
        </div>
        <div className="metric-card">
          <div className="label">Energy risk</div>
          <div className={"value"} style={{ color: riskColor(data.risk), fontSize: 20, textTransform: "uppercase" }}>
            {data.risk}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          Forecast graphs
          <div className="chip-row">
            {Object.entries(graphs).map(([key, g]) => (
              <button key={key} className={"chip" + (graph === key ? " active" : "")} onClick={() => setGraph(key)}>
                {g.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 18 }}>
          <LineChart series={graphs[graph].series} color={graphs[graph].color} fill />
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">AI recommendation</div>
        <div className="note-box" style={{ marginTop: 12 }}>
          {data.recommendation}
        </div>
      </div>
    </>
  );
}

function riskColor(risk) {
  if (risk === "low") return "var(--aurora)";
  if (risk === "moderate") return "var(--amber)";
  return "var(--danger)";
}
