import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import LineChart from "../components/LineChart";
import { api } from "../api";

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const d = await api.dashboard();
        if (alive) setData(d);
      } catch {
        // swallow — could show a toast in a production build
      }
    }
    load();
    const id = setInterval(load, 8000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (!data) {
    return (
      <>
        <Topbar title="Station overview" subtitle="Antarctica — Station A · live telemetry" />
        <div className="loading-state">Loading telemetry…</div>
      </>
    );
  }

  const { snapshot, ai_status, series } = data;

  return (
    <>
      <Topbar title="Station overview" subtitle="Antarctica — Station A · live telemetry" />

      <div className="metric-grid">
        <div className="metric-card aurora-v">
          <div className="label">Battery</div>
          <div className="value">{snapshot.battery}%</div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${snapshot.battery}%` }} />
          </div>
        </div>
        <div className="metric-card">
          <div className="label">Generation</div>
          <div className="value">
            {snapshot.generation} <small>kW</small>
          </div>
          <div className="delta">↑ 6% vs. yesterday</div>
        </div>
        <div className="metric-card">
          <div className="label">Consumption</div>
          <div className="value">
            {snapshot.consumption} <small>kW</small>
          </div>
          <div className="delta down">↓ 3% vs. yesterday</div>
        </div>
        <div className="metric-card ice-v">
          <div className="label">External temperature</div>
          <div className="value">{snapshot.external_temp}°C</div>
          <div className="delta" style={{ color: "var(--slate)" }}>
            Wind {snapshot.wind_speed} m/s
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-title">
            Energy flow <span className="tag">Live</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: 22 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <FlowNode color="var(--amber)" label="Solar" value={`${snapshot.generation_breakdown.solar} kW`} />
              <FlowNode color="var(--ice)" label="Wind" value={`${snapshot.generation_breakdown.wind} kW`} />
              <FlowNode color="var(--aurora)" label="Battery" value="−0.4 kW" />
            </div>
            <div
              style={{
                width: 104,
                height: 104,
                borderRadius: "50%",
                border: "1px solid var(--border-lt)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                fontSize: 10.5,
                color: "var(--slate)",
                background: "radial-gradient(circle, rgba(127,212,240,0.08), transparent 70%)",
                flexShrink: 0,
              }}
            >
              <div>
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: "var(--ice)", fontSize: 11, fontWeight: 600 }}>
                  CONTROLLER
                </div>
                <div style={{ marginTop: 2 }}>{snapshot.generation} kW in</div>
              </div>
            </div>
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  border: "1px solid var(--border-lt)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 8px",
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#7FD4F0" strokeWidth="1.5">
                  <path d="M4 11l8-6 8 6M6 10v9h12v-9" />
                </svg>
              </div>
              <div style={{ fontSize: 11, color: "var(--slate)" }}>
                Station
                <br />
                <span className="mono" style={{ color: "var(--frost)" }}>
                  {snapshot.consumption} kW
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            AI status <span className="tag">Updated moments ago</span>
          </div>
          <div className={"risk-badge" + (ai_status.risk !== "low" ? " " + ai_status.risk : "")}>
            <span className="pulse-dot" /> Energy risk — {ai_status.risk[0].toUpperCase() + ai_status.risk.slice(1)}
          </div>
          <div style={{ marginTop: 6 }}>
            <div className="stat-row">
              <span className="k">Predicted consumption</span>
              <span className="v">{ai_status.predicted_consumption_kw} kW</span>
            </div>
            <div className="stat-row">
              <span className="k">Predicted generation</span>
              <span className="v">{ai_status.predicted_generation_kw} kW</span>
            </div>
            <div className="stat-row">
              <span className="k">Next 6 hours</span>
              <span className="v" style={{ color: ai_status.next_6h_safe ? "var(--aurora)" : "var(--danger)" }}>
                {ai_status.next_6h_safe ? "Safe" : "At risk"}
              </span>
            </div>
          </div>
          <div className="note-box">
            Strong winds expected over the next 4 hours. Charging the battery now is recommended to
            reduce discharge later.
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-title">
            Generated vs. consumed <span className="tag">Today</span>
          </div>
          <div style={{ marginTop: 14 }}>
            <LineChart series={series.generation} color="#7FD4F0" />
          </div>
          <div className="graph-legend">
            <span>
              <span className="sw" style={{ background: "#7FD4F0" }} />
              Generation
            </span>
            <span>
              <span className="sw" style={{ background: "#52D9A8" }} />
              Consumption
            </span>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">
            Battery level <span className="tag">Last 24h</span>
          </div>
          <div style={{ marginTop: 14 }}>
            <LineChart series={series.consumption} color="#E8A339" fill />
          </div>
          <div className="graph-legend">
            <span>
              <span className="sw" style={{ background: "#E8A339" }} />
              Battery %
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

function FlowNode({ color, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "var(--slate)" }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
      {label}
      <span className="mono" style={{ color: "var(--frost)", marginLeft: "auto" }}>
        {value}
      </span>
    </div>
  );
}
