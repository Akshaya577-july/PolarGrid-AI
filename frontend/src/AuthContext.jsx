import { createContext, useContext, useState, useCallback } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("polargrid_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [station, setStation] = useState(
    () => localStorage.getItem("polargrid_station") || "Antarctica - Station A"
  );

  const login = useCallback(async (email, password, role, stationName) => {
    const data = await api.login({ email, password, role, station: stationName });
    localStorage.setItem("polargrid_token", data.token);
    localStorage.setItem("polargrid_user", JSON.stringify(data.user));
    localStorage.setItem("polargrid_station", data.station);
    setUser(data.user);
    setStation(data.station);
    return data;
  }, []);

  const completeSignup = useCallback(async (code, name, password) => {
    const data = await api.signup({ code, name, password });
    localStorage.setItem("polargrid_token", data.token);
    localStorage.setItem("polargrid_user", JSON.stringify(data.user));
    localStorage.setItem("polargrid_station", data.station);
    setUser(data.user);
    setStation(data.station);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem("polargrid_token");
    localStorage.removeItem("polargrid_user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, station, login, logout, completeSignup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
