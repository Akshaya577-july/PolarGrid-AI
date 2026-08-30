import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import LineChart from "../components/LineChart";
import { api } from "../api";

const ranges = [
  { id: "1h", label: "Last 1 hour" },
  { id: "6h", label: "Last 6 hours" },
  { id: "24h", label: "24 hours" },
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
];

export default function EnergyMonitoring() {
  const [range, setRange] = useState("24h");
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    api.energy(range).then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, [range]);

  return (
    <>
      <Topbar title="Energy monitoring" subtitle="Generation and consumption detail" />

      <div className="chip-row" style={{ marginBottom: 20 }}>
        {ranges.map((r) => (
          <button
            key={r.id}
            className={"chip" + (range === r.id ? " active" : "")}
            onClick={() => setRange(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {!data ? (
        <div className="loading-state">Loading telemetry…</div>
      ) : (
        <>
          <div className="two-col">
            <div className="panel">
              <div className="panel-title">
                Generation <span className="tag">By source</span>
              </div>
              <div style={{ marginTop: 6 }}>
                <div className="stat-row">
                  <span className="k">Solar</span>
                  <span className="v">{data.generation_breakdown.solar} kW</span>
                </div>
                <div className="stat-row">
                  <span className="k">Wind</span>
                  <span className="v">{data.generation_breakdown.wind} kW</span>
                </div>
                <div className="stat-row">
                  <span className="k">Backup</span>
                  <span className="v">{data.generation_breakdown.backup} kW</span>
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-title">
                Consumption <span className="tag">By load</span>
              </div>
              <div style={{ marginTop: 6 }}>
                <div className="stat-row">
                  <span className="k">Heating</span>
                  <span className="v">{data.consumption_breakdown.heating} kW</span>
                </div>
                <div className="stat-row">
                  <span className="k">Laboratory</span>
                  <span className="v">{data.consumption_breakdown.laboratory} kW</span>
                </div>
                <div className="stat-row">
                  <span className="k">Communication</span>
                  <span className="v">{data.consumption_breakdown.communication} kW</span>
                </div>
                <div className="stat-row">
                  <span className="k">Lighting</span>
                  <span className="v">{data.consumption_breakdown.lighting} kW</span>
                </div>
                <div className="stat-row">
                  <span className="k">Other</span>
                  <span className="v">{data.consumption_breakdown.other} kW</span>
                </div>
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">
              Power over time <span className="tag">{ranges.find((r) => r.id === range)?.label}</span>
            </div>
            <div style={{ marginTop: 14 }}>
              <LineChart series={data.series.generation} color="#7FD4F0" />
            </div>
            <div className="graph-legend">
              <span>
                <span className="sw" style={{ background: "#7FD4F0" }} />
                Generation (kW)
              </span>
              <span>
                <span className="sw" style={{ background: "#52D9A8" }} />
                Consumption (kW)
              </span>
            </div>
          </div>
        </>
      )}
    </>
  );
}
