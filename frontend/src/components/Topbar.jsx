import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ title, subtitle }) {
  const { user } = useAuth();
  const [clock, setClock] = useState("--:--:--");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      setClock(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const initials = (user?.name || user?.email || "??")
    .split(/[\s.@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("");

  return (
    <div className="topbar">
      <div>
        <h1 className="display">{title}</h1>
        <div className="sub">{subtitle}</div>
      </div>
      <div className="topbar-right">
        <div className="timestamp">
          Last sync
          <span className="mono">{clock}</span>
        </div>
        <div className="avatar">{initials}</div>
      </div>
    </div>
  );
}
