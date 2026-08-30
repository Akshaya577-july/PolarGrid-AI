// Deterministic-ish mock telemetry generator for PolarGrid AI.
// In a real deployment this module would be replaced by readings pulled
// from station sensors / a time-series database (InfluxDB, TimescaleDB, etc).

function rand(min, max) {
  return Math.round((min + Math.random() * (max - min)) * 10) / 10;
}

function seriesFor(hours, base, amplitude, noise) {
  const points = [];
  const now = Date.now();
  const stepMs = (hours * 60 * 60 * 1000) / 24;
  for (let i = 24; i >= 0; i--) {
    const t = now - i * stepMs;
    const wave = Math.sin((i / 24) * Math.PI * 2) * amplitude;
    const value = Math.max(0, base + wave + (Math.random() - 0.5) * noise);
    points.push({ t, v: Math.round(value * 10) / 10 });
  }
  return points;
}

export function getStationSnapshot() {
  const solar = rand(6, 10);
  const wind = rand(8, 13);
  const backup = 0;
  const generation = Math.round((solar + wind + backup) * 10) / 10;

  const heating = rand(5.5, 7);
  const lab = rand(2.5, 3.6);
  const comms = rand(1, 1.5);
  const lighting = rand(0.6, 1);
  const other = rand(1.2, 2);
  const consumption = Math.round((heating + lab + comms + lighting + other) * 10) / 10;

  const battery = Math.round(rand(58, 82));
  const temp = -Math.round(rand(22, 34));
  const wind_speed = Math.round(rand(10, 22));

  return {
    timestamp: Date.now(),
    battery,
    generation,
    consumption,
    external_temp: temp,
    wind_speed,
    generation_breakdown: { solar, wind, backup },
    consumption_breakdown: { heating, laboratory: lab, communication: comms, lighting, other },
  };
}

export function getEnergySeries(range) {
  const hoursMap = { "1h": 1, "6h": 6, "24h": 24, "7d": 168, "30d": 720 };
  const hours = hoursMap[range] || 24;
  return {
    range,
    generation: seriesFor(hours, 17, 4, 3),
    consumption: seriesFor(hours, 13, 2, 2),
  };
}

export function getPredictions() {
  const demand = rand(14, 17);
  const renewable = rand(17, 21);
  const battStart = Math.round(rand(60, 75));
  const battEnd = Math.round(battStart + rand(-10, 12));
  const risk = renewable - demand > 2 ? "low" : renewable - demand > -1 ? "moderate" : "high";

  const recommendations = [
    "Strong winds are expected over the next 4 hours. Charge the battery during this window and reduce discharge.",
    "Solar output is forecast to drop after 16:00. Pre-charge non-critical systems before dusk.",
    "Demand and generation are closely matched over the next 6 hours. No action required.",
  ];

  return {
    horizon_hours: 6,
    predicted_demand_kw: demand,
    predicted_generation_kw: renewable,
    battery_projection: { start_pct: battStart, end_pct: Math.max(5, Math.min(100, battEnd)) },
    risk,
    recommendation: recommendations[Math.floor(Math.random() * recommendations.length)],
    forecast_series: {
      demand: seriesFor(6, demand, 2, 1),
      generation: seriesFor(6, renewable, 3, 1.5),
      temperature: seriesFor(6, -28, 4, 2),
    },
  };
}

export function getBatteryDetail() {
  const level = Math.round(rand(58, 82));
  const health = Math.round(rand(87, 96));
  const temp = -Math.round(rand(12, 22));
  const nominal = 100;
  const tempAdjusted = Math.round(nominal * (health / 100) * 0.9);
  const currentlyAvailable = Math.round(tempAdjusted * (level / 100));

  return {
    level_pct: level,
    state_of_charge_pct: level,
    health_pct: health,
    temperature_c: temp,
    charging: level < 85,
    history: seriesFor(24, level, 8, 3),
    capacity: {
      nominal_kwh: nominal,
      temperature_adjusted_kwh: tempAdjusted,
      currently_available_kwh: currentlyAvailable,
    },
    recommendation: {
      expected_generation: "high",
      action: "charge_battery",
      expected_reserve_pct_after_6h: Math.min(100, level + Math.round(rand(-8, 15))),
    },
  };
}

export function getRenewableDetail() {
  const solarKw = rand(6, 10);
  const solarEff = Math.round(rand(70, 85));
  const windKw = rand(8, 13);
  const windSpeed = Math.round(rand(12, 22));

  return {
    solar: { kw: solarKw, efficiency_pct: solarEff, series: seriesFor(24, solarKw, 2, 1) },
    wind: { kw: windKw, speed_ms: windSpeed, series: seriesFor(24, windKw, 3, 1.5) },
    forecast_24h: {
      solar_pct: Math.round(rand(40, 85)),
      wind_pct: Math.round(rand(50, 95)),
    },
  };
}

export function getLoads() {
  return [
    { id: "heating", name: "Heating", power_kw: rand(5.5, 7), priority: "critical", status: "on" },
    { id: "laboratory", name: "Laboratory", power_kw: rand(2.5, 3.6), priority: "high", status: "on" },
    { id: "server", name: "Server", power_kw: rand(1.2, 1.8), priority: "high", status: "on" },
    { id: "lighting", name: "Lighting", power_kw: rand(0.6, 1), priority: "medium", status: "on" },
    { id: "recreation", name: "Recreation", power_kw: rand(0.9, 1.5), priority: "low", status: "standby" },
  ];
}

export function getEmergencyStatus() {
  const reserve = Math.round(rand(30, 55));
  const status = reserve > 35 ? "normal" : reserve > 20 ? "warning" : "critical";

  const alerts = [];
  if (status !== "normal") {
    alerts.push({
      level: status,
      title: status === "critical" ? "Predicted energy shortage in 3 hours" : "Severe weather predicted in 8 hours",
      body:
        status === "critical"
          ? "Disable non-critical loads, preserve heating and communication, start the backup generator."
          : "AI recommends increasing emergency battery reserve from 20% to 40%.",
    });
  }

  return {
    status,
    battery_reserve_pct: reserve,
    critical_loads: "safe",
    backup_generator: "ready",
    emergency_power: "available",
    alerts,
  };
}

export function getDigitalTwin() {
  return {
    zones: [
      { id: "lab", name: "Lab", icon: "flask", power_kw: rand(2.5, 3.6), temp_c: 19, occupancy: 2, status: "normal" },
      { id: "living", name: "Living", icon: "home", power_kw: rand(2, 2.8), temp_c: 21, occupancy: 4, status: "normal" },
      { id: "server", name: "Server", icon: "server", power_kw: rand(1.2, 1.8), temp_c: 17, occupancy: 0, status: "normal" },
      { id: "heat", name: "Heat plant", icon: "flame", power_kw: rand(5.5, 7), temp_c: 24, occupancy: 0, status: "normal" },
      { id: "emerg", name: "Emergency", icon: "alert", power_kw: rand(0.3, 0.6), temp_c: 20, occupancy: 0, status: "critical" },
    ],
  };
}

export function getReports(period) {
  const base = { daily: 1, weekly: 7, monthly: 30, yearly: 365 }[period] || 1;
  return {
    period,
    renewable_pct: Math.round(rand(60, 74)),
    fuel_dependency_pct: Math.round(rand(26, 40)),
    energy_saved_pct: Math.round(rand(12, 22)),
    co2_reduction_pct: Math.round(rand(18, 28)),
    battery_efficiency_pct: Math.round(rand(88, 94)),
    prediction_accuracy_pct: Math.round(rand(85, 96)),
    series: seriesFor(Math.min(base * 24, 720), 15, 4, 2),
  };
}

const defaultSettings = {
  station_name: "Antarctica - Station A",
  emergency_reserve_pct: 30,
  critical_battery_pct: 15,
  temperature_alert_c: -35,
  load_priorities: { heating: "critical", laboratory: "high", server: "high", lighting: "medium", recreation: "low" },
  ai_settings: { auto_recommendations: true, prediction_horizon_hours: 6 },
};

let settingsStore = { ...defaultSettings };

export function getSettings() {
  return settingsStore;
}

export function updateSettings(patch) {
  settingsStore = { ...settingsStore, ...patch };
  return settingsStore;
}
