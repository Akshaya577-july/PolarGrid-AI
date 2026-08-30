import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import { api } from "../api";

export default function EmergencyCenter() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    async function load() {
      const d = await api.emergency();
      if (alive) setData(d);
    }
    load();
    const id = setInterval(load, 10000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (!data) {
    return (
      <>
        <Topbar title="Emergency center" subtitle="Station safety status" />
        <div className="loading-state">Checking station safety systems…</div>
      </>
    );
  }

  const statusColor = { normal: "var(--aurora)", warning: "var(--amber)", critical: "var(--danger)" }[data.status];

  return (
    <>
      <Topbar title="Emergency center" subtitle="Station safety status" />

      <div className="panel" style={{ textAlign: "center", padding: "36px 22px" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--slate)" }}>
          Energy safety
        </div>
        <div
          className="display"
          style={{ fontSize: 30, fontWeight: 600, color: statusColor, marginTop: 10, letterSpacing: "0.04em" }}
        >
          {data.status.toUpperCase()}
        </div>
      </div>

      <div className="metric-grid">
        <div className="metric-card">
          <div className="label">Battery reserve</div>
          <div className="value">{data.battery_reserve_pct}%</div>
        </div>
        <div className="metric-card aurora-v">
          <div className="label">Critical loads</div>
          <div className="value" style={{ fontSize: 18, textTransform: "capitalize" }}>
            {data.critical_loads}
          </div>
        </div>
        <div className="metric-card ice-v">
          <div className="label">Backup generator</div>
          <div className="value" style={{ fontSize: 18, textTransform: "capitalize" }}>
            {data.backup_generator}
          </div>
        </div>
        <div className="metric-card">
          <div className="label">Emergency power</div>
          <div className="value" style={{ fontSize: 18, textTransform: "capitalize" }}>
            {data.emergency_power}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">Alerts</div>
        {data.alerts.length === 0 ? (
          <div className="note-box" style={{ borderLeftColor: "var(--aurora)" }}>
            No active alerts. All safety systems are operating normally.
          </div>
        ) : (
          data.alerts.map((a, i) => (
            <div
              key={i}
              style={{
                marginTop: 12,
                padding: "14px 16px",
                background: "var(--panel-2)",
                borderLeft: `2px solid ${a.level === "critical" ? "var(--danger)" : "var(--amber)"}`,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: a.level === "critical" ? "var(--danger)" : "var(--amber)",
                  marginBottom: 6,
                }}
              >
                {a.level}
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 500, marginBottom: 4 }}>{a.title}</div>
              <div style={{ fontSize: 12.5, color: "var(--slate)", lineHeight: 1.6 }}>{a.body}</div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
