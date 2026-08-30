import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email || !password || !email.includes("@")) {
      setError("Enter a valid email and password.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password, role, "Antarctica - Station A");
      setRedirecting(true);
      setTimeout(() => navigate("/dashboard"), 700);
    } catch (err) {
      setError(err.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-body">
      <div className="telemetry-panel">
        <div className="snowfield" />
        <div className="brand-mark" style={{ padding: 0, border: "none", marginBottom: 0 }}>
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
            <circle cx="15" cy="15" r="13.5" stroke="#7FD4F0" strokeWidth="1.2" />
            <path
              d="M15 3V27M4.5 9L25.5 21M4.5 21L25.5 9M6 15H24M8 6L22 24M22 6L8 24"
              stroke="#7FD4F0"
              strokeWidth="1"
            />
          </svg>
          <div className="brand-text">
            <div className="name">POLARGRID AI</div>
            <div className="sub">Research Station Energy Platform</div>
          </div>
        </div>

        <div className="headline">
          <h1>
            The grid that <em>reads the weather</em>
            <br />
            before it hits.
          </h1>
          <p>
            Live renewable, battery and load telemetry for Antarctic research stations, with AI
            forecasting six hours ahead of the ice.
          </p>
        </div>

        <div className="telemetry-grid">
          <div className="telemetry-cell">
            <div className="label">Position</div>
            <div className="value mono">75.10°S 123.35°E</div>
          </div>
          <div className="telemetry-cell">
            <div className="label">Ext. temp</div>
            <div className="value">−28.4°C</div>
          </div>
          <div className="telemetry-cell">
            <div className="label">Wind speed</div>
            <div className="value">18 m/s</div>
          </div>
          <div className="telemetry-cell">
            <div className="label">Battery reserve</div>
            <div className="value aurora-c">72%</div>
          </div>
          <div className="telemetry-cell">
            <div className="label">Energy risk</div>
            <div className="value aurora-c">LOW</div>
          </div>
          <div className="telemetry-cell">
            <div className="label">Aurora activity</div>
            <div className="value amber-c">Kp 5</div>
          </div>
        </div>

        <div className="status-row">
          <span className="pulse-dot" /> All systems nominal &mdash; link established with Station A
        </div>
      </div>

      <div className="login-panel">
        <div className="console-card">
          <div className="console-title">Sign in</div>
          <div className="console-sub">Enter your credentials to access the station dashboard.</div>

          <div className="role-tabs">
            {["admin", "researcher", "emergency"].map((r) => (
              <button
                key={r}
                type="button"
                className={"role-tab" + (role === r ? " active" : "")}
                data-role={r}
                onClick={() => setRole(r)}
              >
                {r[0].toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <div className="field-input-wrap">
                <input
                  id="email"
                  type="email"
                  placeholder="you@polarstation.org"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="field-input-wrap">
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="toggle-visibility" onClick={() => setShowPw((s) => !s)}>
                  {showPw ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {error && <div className="error-msg show">{error}</div>}

            <div className="station-line">
              <span>Station</span>
              <span>ANTARCTICA — STATION A</span>
            </div>

            <button type="submit" className="login-btn" data-role={role} disabled={loading}>
              <span className={"spinner" + (loading ? " show" : "")} />
              <span>{loading ? "Authenticating…" : "Login"}</span>
            </button>

            {redirecting && (
              <div className="redirect-msg show">
                <span className="pulse-dot" /> Redirecting to dashboard…
              </div>
            )}
          </form>

          <div className="bottom-row">
            <a href="#forgot">Forgot password?</a>
            <span style={{ color: "var(--slate)" }}>v2.4.1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
