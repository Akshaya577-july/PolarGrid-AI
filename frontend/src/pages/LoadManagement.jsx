import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import { api } from "../api";

export default function LoadManagement() {
  const [loads, setLoads] = useState(null);

  useEffect(() => {
    let alive = true;
    api.loads().then((d) => alive && setLoads(d.loads));
    return () => {
      alive = false;
    };
  }, []);

  async function toggle(id) {
    const { load } = await api.toggleLoad(id);
    setLoads((prev) => prev.map((l) => (l.id === id ? load : l)));
  }

  return (
    <>
      <Topbar title="Smart load management" subtitle="Priority-ordered station loads" />

      <div className="panel">
        <div className="panel-title">
          Station loads <span className="tag">Click a status pill to cycle it</span>
        </div>

        {!loads ? (
          <div className="loading-state">Loading loads…</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Load</th>
                <th>Power</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loads.map((l) => (
                <tr key={l.id}>
                  <td>{l.name}</td>
                  <td className="mono">{l.power_kw} kW</td>
                  <td>
                    <span className={"priority-tag " + l.priority}>{cap(l.priority)}</span>
                  </td>
                  <td>
                    <button
                      className={"status-pill " + l.status}
                      style={{ border: "none", cursor: "pointer" }}
                      onClick={() => toggle(l.id)}
                    >
                      <span className="pulse-dot" style={{ background: "currentColor" }} />
                      {l.status.toUpperCase()}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="panel">
        <div className="panel-title">AI shed order if energy becomes low</div>
        <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            "Battery reserve drops below threshold",
            "AI detects rising energy risk",
            "Recreation → off",
            "Non-critical lighting → reduced",
            "Laboratory → scheduled",
            "Heating and emergency systems → protected",
          ].map((step, i, arr) => (
            <div key={step} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                className="mono"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: "1px solid var(--border-lt)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10.5,
                  color: "var(--slate)",
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <span style={{ fontSize: 13, color: i >= arr.length - 1 ? "var(--aurora)" : "var(--frost)" }}>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function cap(s) {
  return s[0].toUpperCase() + s.slice(1);
}
