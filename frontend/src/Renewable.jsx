import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import LineChart from "../components/LineChart";
import { api } from "../api";

export default function Renewable() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    api.renewable().then((d) => alive && setData(d));
    return () => {
      alive = false;
    };
  }, []);

  if (!data) {
    return (
      <>
        <Topbar title="Renewable energy" subtitle="Solar and wind generation detail" />
        <div className="loading-state">Loading renewable telemetry…</div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Renewable energy" subtitle="Solar and wind generation detail" />

      <div className="two-col">
        <div className="panel">
          <div className="panel-title">
            Solar generation <span className="tag">{data.solar.efficiency_pct}% efficiency</span>
          </div>
          <div className="metric-card amber-v" style={{ border: "none", padding: "14px 0" }}>
            <div className="value" style={{ fontSize: 32 }}>
              {data.solar.kw} <small>kW</small>
            </div>
          </div>
          <LineChart series={data.solar.series} color="#E8A339" fill />
        </div>

        <div className="panel">
          <div className="panel-title">
            Wind generation <span className="tag">{data.wind.speed_ms} m/s</span>
          </div>
          <div className="metric-card ice-v" style={{ border: "none", padding: "14px 0" }}>
            <div className="value" style={{ fontSize: 32 }}>
              {data.wind.kw} <small>kW</small>
            </div>
          </div>
          <LineChart series={data.wind.series} color="#7FD4F0" fill />
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          Next 24 hours forecast <span className="tag">Relative output</span>
        </div>
        <div style={{ marginTop: 18 }}>
          <ForecastBar label="Solar" pct={data.forecast_24h.solar_pct} color="#E8A339" />
          <ForecastBar label="Wind" pct={data.forecast_24h.wind_pct} color="#7FD4F0" />
        </div>
      </div>
    </>
  );
}

function ForecastBar({ label, pct, color }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--slate)", marginBottom: 6 }}>
        <span>{label}</span>
        <span className="mono" style={{ color: "var(--frost)" }}>
          {pct}%
        </span>
      </div>
      <div className="bar-track" style={{ height: 8 }}>
        <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
