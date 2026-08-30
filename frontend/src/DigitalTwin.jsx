import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import { api } from "../api";

const zoneIcons = {
  flask: <path d="M9 3h6M10 3v6l-5.5 9a2 2 0 001.7 3h11.6a2 2 0 001.7-3L14 9V3" />,
  home: <path d="M4 11l8-6 8 6M6 10v9h12v-9" />,
  server: <path d="M4 4h16v6H4zM4 14h16v6H4zM8 7h.01M8 17h.01" />,
  flame: <path d="M12 2c1 3-2 4-2 7a4 4 0 108 0c0-1-1-2-1-2 1 3-1 4-1 6a4 4 0 01-8 0c0-4 3-6 4-11z" />,
  alert: <path d="M12 2L2 20h20L12 2zM12 9v5M12 17h.01" />,
};

export default function DigitalTwin() {
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let alive = true;
    api.twin().then((d) => {
      if (!alive) return;
      setData(d);
      setSelected(d.zones[0]);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!data) {
    return (
      <>
        <Topbar title="Digital twin" subtitle="Live virtual replica of the station" />
        <div className="loading-state">Rendering station model…</div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Digital twin" subtitle="Live virtual replica of the station" />

      <div className="zone-grid">
        {data.zones.map((z) => (
          <div
            key={z.id}
            className={"zone-cell" + (z.status === "critical" ? " critical" : "") + (selected?.id === z.id ? " selected" : "")}
            onClick={() => setSelected(z)}
          >
            <div className="zname">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                {zoneIcons[z.icon]}
              </svg>
              {z.name}
            </div>
            <div className="zpower mono">{z.power_kw} kW</div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="panel" style={{ marginTop: 14 }}>
          <div className="panel-title">
            {selected.name} <span className="tag">Zone detail</span>
          </div>
          <div style={{ marginTop: 6 }}>
            <div className="stat-row">
              <span className="k">Temperature</span>
              <span className="v">{selected.temp_c}°C</span>
            </div>
            <div className="stat-row">
              <span className="k">Occupancy</span>
              <span className="v">{selected.occupancy} people</span>
            </div>
            <div className="stat-row">
              <span className="k">Energy consumption</span>
              <span className="v">{selected.power_kw} kW</span>
            </div>
            <div className="stat-row">
              <span className="k">Equipment status</span>
              <span className="v" style={{ color: selected.status === "critical" ? "var(--danger)" : "var(--aurora)" }}>
                {selected.status === "critical" ? "Attention required" : "Nominal"}
              </span>
            </div>
          </div>
          <div className="note-box">
            {selected.status === "critical"
              ? "AI recommends prioritizing power to this zone and dispatching a check within the hour."
              : "AI reports this zone is operating within expected parameters."}
          </div>
        </div>
      )}
    </>
  );
}
