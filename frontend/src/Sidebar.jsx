import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const icons = {
  dashboard: <path d="M4 11l8-6 8 6M6 10v9h12v-9" />,
  energy: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
  ai: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  battery: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="1" />
      <path d="M10 8h4" />
    </>
  ),
  renewable: <path d="M3 15c2-4 4 4 6 0s4 4 6 0 4 4 6 0" />,
  load: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </>
  ),
  emergency: (
    <>
      <path d="M12 2L2 20h20L12 2z" />
      <path d="M12 9v5M12 17h.01" />
    </>
  ),
  twin: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="1" />
      <path d="M3 9h18M9 4v16" />
    </>
  ),
  reports: <path d="M4 19V9M10 19V5M16 19v-7M22 19H2" />,
  invites: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5M16 8h5M18.5 5.5v5" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 00-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 00-2-1.2L14 3h-4l-.6 2.6a7 7 0 00-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 005 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9c.6.5 1.3.9 2 1.2L10 21h4l.6-2.6c.7-.3 1.4-.7 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z" />
    </>
  ),
};

function Icon({ name }) {
  return (
    <span className="nav-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        {icons[name]}
      </svg>
    </span>
  );
}

function buildItems(role) {
  const items = [
    { group: "Overview", links: [{ to: "/dashboard", label: "Dashboard", icon: "dashboard" }] },
  {
    group: "Energy",
    links: [
      { to: "/energy", label: "Energy monitoring", icon: "energy" },
      { to: "/predictions", label: "AI predictions", icon: "ai" },
      { to: "/battery", label: "Battery management", icon: "battery" },
      { to: "/renewable", label: "Renewable energy", icon: "renewable" },
      { to: "/loads", label: "Load management", icon: "load" },
    ],
  },
    {
      group: "Station",
      links: [
        { to: "/emergency", label: "Emergency center", icon: "emergency", emergency: true },
        { to: "/twin", label: "Digital twin", icon: "twin" },
        { to: "/reports", label: "Reports and analytics", icon: "reports" },
        { to: "/settings", label: "Settings", icon: "settings" },
      ],
    },
  ];

  if (role === "admin") {
    items.push({
      group: "Administration",
      links: [{ to: "/invites", label: "Invites", icon: "invites" }],
    });
  }

  return items;
}

export default function Sidebar() {
  const { user, station, logout } = useAuth();
  const items = buildItems(user?.role);

  return (
    <div className="sidebar">
      <div className="brand-mark">
        <svg width="26" height="26" viewBox="0 0 30 30" fill="none">
          <circle cx="15" cy="15" r="13.5" stroke="#7FD4F0" strokeWidth="1.2" />
          <path
            d="M15 3V27M4.5 9L25.5 21M4.5 21L25.5 9M6 15H24M8 6L22 24M22 6L8 24"
            stroke="#7FD4F0"
            strokeWidth="1"
          />
        </svg>
        <div className="brand-text">
          <div className="name">POLARGRID AI</div>
          <div className="sub">{station?.split(" - ")[1] || "Station"}</div>
        </div>
      </div>

      {items.map((group) => (
        <div key={group.group}>
          <div className="nav-group-label">{group.group}</div>
          {group.links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                "nav-item" + (link.emergency ? " emergency" : "") + (isActive ? " active" : "")
              }
            >
              <Icon name={link.icon} />
              {link.label}
            </NavLink>
          ))}
        </div>
      ))}

      <div className="sidebar-footer">
        <div style={{ fontSize: 11, color: "var(--slate)" }}>Signed in as</div>
        <div style={{ fontSize: 12.5, color: "var(--frost)", marginTop: 2 }}>
          {user?.name || user?.email} &middot; {user?.role}
        </div>
        <div className="status-row">
          <span className="pulse-dot" /> Link stable &mdash; {station}
        </div>
        <button className="logout-btn" onClick={logout}>
          Log out
        </button>
      </div>
    </div>
  );
}
