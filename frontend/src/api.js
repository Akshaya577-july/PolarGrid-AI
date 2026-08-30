const BASE = "/api";

function authHeaders() {
  const token = localStorage.getItem("polargrid_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),

  // Invite-only account creation: only an admin can mint an invite, and it
  // only works once, for the email/role it was issued for.
  createInvite: (payload) =>
    request("/auth/invites", { method: "POST", body: JSON.stringify(payload) }),
  listInvites: () => request("/auth/invites"),
  checkInvite: (code) => request(`/auth/invites/${encodeURIComponent(code)}`),
  signup: (payload) => request("/auth/signup", { method: "POST", body: JSON.stringify(payload) }),

  dashboard: () => request("/dashboard"),
  energy: (range) => request(`/energy?range=${encodeURIComponent(range)}`),
  predictions: () => request("/predictions"),
  battery: () => request("/battery"),
  renewable: () => request("/renewable"),
  loads: () => request("/loads"),
  toggleLoad: (id) => request(`/loads/${id}/toggle`, { method: "POST" }),
  emergency: () => request("/emergency"),
  twin: () => request("/twin"),
  reports: (period) => request(`/reports?period=${encodeURIComponent(period)}`),
  getSettings: () => request("/settings"),
  updateSettings: (patch) => request("/settings", { method: "PUT", body: JSON.stringify(patch) }),
};
