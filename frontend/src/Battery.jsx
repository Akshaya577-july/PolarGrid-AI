import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import LineChart from "../components/LineChart";
import { api } from "../api";

export default function Battery() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    api.battery().then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, []);

  if (!data) {
    return (
      <>
        <Topbar title="Battery management" subtitle="Charge, health and thermal detail" />
        <div className="loading-state">Loading battery telemetry…</div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Battery management" subtitle="Charge, health and thermal detail" />

      <div className="metric-grid">
        <div className="metric-card aurora-v">
          <div className="label">Battery level</div>
          <div className="value">{data.level_pct}%</div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${data.level_pct}%` }} />
          </div>
        </div>
        <div className="metric-card">
          <div className="label">Battery health</div>
          <div className="value">{data.health_pct}%</div>
        </div>
        <div className="metric-card ice-v">
          <div className="label">Temperature</div>
          <div className="value">{data.temperature_c}°C</div>
        </div>
        <div className="metric-card">
          <div className="label">Charging</div>
          <div className="value" style={{ color: data.charging ? "var(--aurora)" : "var(--slate)" }}>
            {data.charging ? "Yes" : "No"}
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-title">
            Battery percentage <span className="tag">Last 24h</span>
          </div>
          <div style={{ marginTop: 14 }}>
            <LineChart series={data.history} color="#52D9A8" fill />
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">AI recommendation</div>
          <div style={{ marginTop: 6 }}>
            <div className="stat-row">
              <span className="k">Expected generation</span>
              <span className="v" style={{ textTransform: "capitalize" }}>
                {data.recommendation.expected_generation}
              </span>
            </div>
            <div className="stat-row">
              <span className="k">Recommended action</span>
              <span className="v" style={{ textTransform: "capitalize" }}>
                {data.recommendation.action.replace("_", " ")}
              </span>
            </div>
            <div className="stat-row">
              <span className="k">Reserve after 6h</span>
              <span className="v">{data.recommendation.expected_reserve_pct_after_6h}%</span>
            </div>
          </div>
          <div className="note-box">
            Expected renewable generation is {data.recommendation.expected_generation}. Recommended
            action: {data.recommendation.action.replace("_", " ")}.
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">Temperature-adjusted usable energy</div>
        <div style={{ marginTop: 6 }}>
          <div className="stat-row">
            <span className="k">Nominal capacity</span>
            <span className="v">{data.capacity.nominal_kwh} kWh</span>
          </div>
          <div className="stat-row">
            <span className="k">Temperature-adjusted</span>
            <span className="v">{data.capacity.temperature_adjusted_kwh} kWh</span>
          </div>
          <div className="stat-row">
            <span className="k">Currently available</span>
            <span className="v">{data.capacity.currently_available_kwh} kWh</span>
          </div>
        </div>
      </div>
    </>
  );
}
