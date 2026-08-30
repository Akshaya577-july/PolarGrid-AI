import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Topbar from "../components/Topbar";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";

function fmt(ts) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString();
}

export default function Invites() {
  const { user } = useAuth();
  const [invites, setInvites] = useState(null);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("researcher");
  const [error, setError] = useState("");
  const [lastLink, setLastLink] = useState("");
  const [copied, setCopied] = useState(false);

  function refresh() {
    api.listInvites().then((d) => setInvites(d.invites));
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError("");
    setLastLink("");
    try {
      const invite = await api.createInvite({ email: email.trim(), role });
      const link = `${window.location.origin}/signup/${invite.code}`;
      setLastLink(link);
      setEmail("");
      refresh();
    } catch (err) {
      setError(err.message || "Could not create invite.");
    }
  }

  function copyLink() {
    navigator.clipboard?.writeText(lastLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (user && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <>
      <Topbar title="Invites" subtitle="Issue account access — signup is invite-only" />

      <div className="panel">
        <div className="panel-title">Invite a new user</div>
        <form onSubmit={handleCreate} style={{ marginTop: 18 }}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div className="settings-field" style={{ minWidth: 260 }}>
              <label>Email</label>
              <input
                type="email"
                placeholder="newuser@polarstation.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="settings-field">
              <label>Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="admin">Admin</option>
                <option value="researcher">Researcher</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            <button type="submit" className="login-btn" style={{ width: "auto", padding: "0 22px" }}>
              Generate invite
            </button>
          </div>
        </form>

        {error && <div className="error-msg show" style={{ marginTop: 14 }}>{error}</div>}

        {lastLink && (
          <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <code style={{ fontSize: 12.5 }}>{lastLink}</code>
            <button type="button" className="toggle-visibility" onClick={copyLink}>
              {copied ? "COPIED" : "COPY"}
            </button>
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Expires in 7 days, single use.</span>
          </div>
        )}
      </div>

      <div className="panel">
        <div className="panel-title">Pending &amp; past invites</div>
        <div style={{ marginTop: 14, overflowX: "auto" }}>
          {!invites ? (
            <div className="loading-state">Loading invites…</div>
          ) : invites.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--slate)" }}>No invites issued yet.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "var(--slate)" }}>
                  <th style={{ padding: "8px 6px" }}>Email</th>
                  <th style={{ padding: "8px 6px" }}>Role</th>
                  <th style={{ padding: "8px 6px" }}>Status</th>
                  <th style={{ padding: "8px 6px" }}>Created</th>
                  <th style={{ padding: "8px 6px" }}>Expires</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((inv) => (
                  <tr key={inv.code} style={{ borderTop: "1px solid var(--border, #22303f)" }}>
                    <td style={{ padding: "8px 6px" }}>{inv.email}</td>
                    <td style={{ padding: "8px 6px" }}>{inv.role}</td>
                    <td style={{ padding: "8px 6px", textTransform: "capitalize" }}>{inv.status}</td>
                    <td style={{ padding: "8px 6px" }}>{fmt(inv.created_at)}</td>
                    <td style={{ padding: "8px 6px" }}>{fmt(inv.expires_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
