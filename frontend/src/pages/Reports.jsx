import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import LineChart from "../components/LineChart";
import { api } from "../api";

const periods = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "yearly", label: "Yearly" },
];

export default function Reports() {
  const [period, setPeriod] = useState("daily");
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    api.reports(period).then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, [period]);

  return (
    <>
      <Topbar title="Reports and analytics" subtitle="Long-term station performance" />

      <div className="chip-row" style={{ marginBottom: 20 }}>
        {periods.map((p) => (
          <button
            key={p.id}
            className={"chip" + (period === p.id ? " active" : "")}
            onClick={() => setPeriod(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {!data ? (
        <div className="loading-state">Compiling report…</div>
      ) : (
        <>
          <div className="metric-grid">
            <div className="metric-card aurora-v">
              <div className="label">Renewable energy</div>
              <div className="value">{data.renewable_pct}%</div>
            </div>
            <div className="metric-card">
              <div className="label">Fuel dependency</div>
              <div className="value">{data.fuel_dependency_pct}%</div>
            </div>
            <div className="metric-card ice-v">
              <div className="label">Energy saved</div>
              <div className="value">{data.energy_saved_pct}%</div>
            </div>
            <div className="metric-card">
              <div className="label">CO2 reduction</div>
              <div className="value">{data.co2_reduction_pct}%</div>
            </div>
          </div>

          <div className="two-col">
            <div className="panel">
              <div className="panel-title">Battery efficiency</div>
              <div className="value mono" style={{ fontSize: 30, marginTop: 10, color: "var(--frost)" }}>
                {data.battery_efficiency_pct}%
              </div>
            </div>
            <div className="panel">
              <div className="panel-title">AI prediction accuracy</div>
              <div className="value mono" style={{ fontSize: 30, marginTop: 10, color: "var(--ice)" }}>
                {data.prediction_accuracy_pct}%
              </div>
            </div>
          </div>

          <div className="panel">
            <div className="panel-title">
              Performance trend <span className="tag">{periods.find((p) => p.id === period)?.label}</span>
            </div>
            <div style={{ marginTop: 14 }}>
              <LineChart series={data.series} color="#52D9A8" fill />
            </div>
          </div>
        </>
      )}
    </>
  );
}
