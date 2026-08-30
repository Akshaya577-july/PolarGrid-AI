import { useEffect, useState } from "react";
import Topbar from "../components/Topbar";
import { api } from "../api";

export default function Settings() {
  const [form, setForm] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getSettings().then(setForm);
  }, []);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  async function save(e) {
    e.preventDefault();
    const updated = await api.updateSettings(form);
    setForm(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (!form) {
    return (
      <>
        <Topbar title="Settings" subtitle="Station and platform configuration" />
        <div className="loading-state">Loading configuration…</div>
      </>
    );
  }

  return (
    <>
      <Topbar title="Settings" subtitle="Station and platform configuration" />

      <form onSubmit={save}>
        <div className="panel">
          <div className="panel-title">Station configuration</div>
          <div style={{ marginTop: 18 }}>
            <div className="settings-field">
              <label>Station name</label>
              <input
                type="text"
                value={form.station_name}
                onChange={(e) => update("station_name", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">Energy thresholds</div>
          <div style={{ marginTop: 18, display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div className="settings-field">
              <label>Emergency reserve (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.emergency_reserve_pct}
                onChange={(e) => update("emergency_reserve_pct", Number(e.target.value))}
              />
            </div>
            <div className="settings-field">
              <label>Critical battery level (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={form.critical_battery_pct}
                onChange={(e) => update("critical_battery_pct", Number(e.target.value))}
              />
            </div>
            <div className="settings-field">
              <label>Temperature alert (°C)</label>
              <input
                type="number"
                value={form.temperature_alert_c}
                onChange={(e) => update("temperature_alert_c", Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">Load priorities</div>
          <div style={{ marginTop: 18, display: "flex", gap: 24, flexWrap: "wrap" }}>
            {Object.entries(form.load_priorities).map(([key, val]) => (
              <div className="settings-field" key={key}>
                <label>{key[0].toUpperCase() + key.slice(1)}</label>
                <select
                  value={val}
                  onChange={(e) =>
                    update("load_priorities", { ...form.load_priorities, [key]: e.target.value })
                  }
                >
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-title">AI settings</div>
          <div style={{ marginTop: 18, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div className="settings-field">
              <label>Prediction horizon (hours)</label>
              <input
                type="number"
                min="1"
                max="24"
                value={form.ai_settings.prediction_horizon_hours}
                onChange={(e) =>
                  update("ai_settings", {
                    ...form.ai_settings,
                    prediction_horizon_hours: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="settings-field" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <label style={{ marginBottom: 0 }}>Auto recommendations</label>
              <input
                type="checkbox"
                style={{ width: "auto", padding: 0 }}
                checked={form.ai_settings.auto_recommendations}
                onChange={(e) =>
                  update("ai_settings", { ...form.ai_settings, auto_recommendations: e.target.checked })
                }
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button type="submit" className="btn btn-primary">
            Save changes
          </button>
          {saved && <span style={{ fontSize: 12.5, color: "var(--aurora)" }}>Settings saved.</span>}
        </div>
      </form>
    </>
  );
}
