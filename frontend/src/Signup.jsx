import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

export default function Signup() {
  const { code } = useParams();
  const { completeSignup } = useAuth();
  const navigate = useNavigate();

  const [invite, setInvite] = useState(null);
  const [checking, setChecking] = useState(true);
  const [checkError, setCheckError] = useState("");

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .checkInvite(code)
      .then(setInvite)
      .catch((err) => setCheckError(err.message || "This invite link is invalid."))
      .finally(() => setChecking(false));
  }, [code]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Enter your full name.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await completeSignup(code, name.trim(), password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Could not create your account.");
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
            Access is <em>by invitation</em>
            <br />
            only.
          </h1>
          <p>
            Accounts are created by station admins. If you've landed here without a link from
            one, you won't be able to sign up.
          </p>
        </div>
      </div>

      <div className="login-panel">
        <div className="console-card">
          {checking ? (
            <div className="loading-state">Checking invite…</div>
          ) : checkError ? (
            <>
              <div className="console-title">Invite not valid</div>
              <div className="console-sub">{checkError}</div>
              <div className="bottom-row" style={{ marginTop: 18 }}>
                <a href="/login">Back to login</a>
              </div>
            </>
          ) : (
            <>
              <div className="console-title">Create your account</div>
              <div className="console-sub">
                Invited as <strong>{invite.role}</strong> &mdash; {invite.email}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="name">Full name</label>
                  <div className="field-input-wrap">
                    <input
                      id="name"
                      type="text"
                      placeholder="Jane Doe"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="password">Password</label>
                  <div className="field-input-wrap">
                    <input
                      id="password"
                      type="password"
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="confirm">Confirm password</label>
                  <div className="field-input-wrap">
                    <input
                      id="confirm"
                      type="password"
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                    />
                  </div>
                </div>

                {error && <div className="error-msg show">{error}</div>}

                <button type="submit" className="login-btn" disabled={loading}>
                  <span className={"spinner" + (loading ? " show" : "")} />
                  <span>{loading ? "Creating account…" : "Create account"}</span>
                </button>
              </form>

              <div className="bottom-row">
                <a href="/login">Already have an account? Sign in</a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
