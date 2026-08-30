import { Router } from "express";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import {
  findUserByEmail,
  createUser,
  createInvite,
  findInvite,
  markInviteUsed,
  listInvites,
  createSession,
  findSession,
  findUserById,
  deleteSession,
} from "../db.js";

const router = Router();

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function publicUser(user) {
  return { id: user.id, email: user.email, role: user.role, name: user.name };
}

// ---- Login (real DB + hashed passwords) ------------------------------

router.post("/login", (req, res) => {
  const { email, password, station } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = findUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  const token = createSession(user.id);

  res.json({
    token,
    user: publicUser(user),
    station: station || "Antarctica - Station A",
  });
});

router.post("/logout", (req, res) => {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  deleteSession(token);
  res.json({ ok: true });
});

export function requireAuth(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const session = findSession(token);
  if (!session) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  const user = findUserById(session.user_id);
  if (!user) {
    return res.status(401).json({ error: "Not authenticated." });
  }
  req.user = user;
  next();
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Not authorized for this action." });
    }
    next();
  };
}

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// ---- Invite-only signup -----------------------------------------------
// There is no open "create account" endpoint. An admin generates an
// invite for a specific email + role; only someone holding that invite's
// code can create an account, and only for that email/role, and only once.

router.post("/invites", requireAuth, requireRole("admin"), (req, res) => {
  const { email, role } = req.body || {};
  if (!email || !role) {
    return res.status(400).json({ error: "Email and role are required." });
  }
  if (!["admin", "researcher", "emergency"].includes(role)) {
    return res.status(400).json({ error: "Invalid role." });
  }
  if (findUserByEmail(email)) {
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const code = nanoid(24);
  const invite = createInvite({
    email,
    role,
    invitedBy: req.user.id,
    code,
    ttlMs: INVITE_TTL_MS,
  });

  res.status(201).json({
    code: invite.code,
    email: invite.email,
    role: invite.role,
    expires_at: invite.expires_at,
    signup_path: `/signup/${invite.code}`,
  });
});

router.get("/invites", requireAuth, requireRole("admin"), (req, res) => {
  const invites = listInvites().map((i) => ({
    code: i.code,
    email: i.email,
    role: i.role,
    created_at: i.created_at,
    expires_at: i.expires_at,
    used_at: i.used_at,
    status: i.used_at ? "used" : Date.now() > i.expires_at ? "expired" : "pending",
  }));
  res.json({ invites });
});

// Public: check an invite code is valid before showing the signup form.
router.get("/invites/:code", (req, res) => {
  const invite = findInvite(req.params.code);
  if (!invite) return res.status(404).json({ error: "Invite not found." });
  if (invite.used_at) return res.status(410).json({ error: "This invite has already been used." });
  if (Date.now() > invite.expires_at) {
    return res.status(410).json({ error: "This invite has expired." });
  }
  res.json({ email: invite.email, role: invite.role });
});

router.post("/signup", (req, res) => {
  const { code, name, password } = req.body || {};
  if (!code || !name || !password) {
    return res.status(400).json({ error: "Name, password, and invite code are required." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  const invite = findInvite(code);
  if (!invite) return res.status(404).json({ error: "Invite not found." });
  if (invite.used_at) return res.status(410).json({ error: "This invite has already been used." });
  if (Date.now() > invite.expires_at) {
    return res.status(410).json({ error: "This invite has expired." });
  }
  if (findUserByEmail(invite.email)) {
    markInviteUsed(code);
    return res.status(409).json({ error: "An account with this email already exists." });
  }

  const user = createUser({ email: invite.email, password, name, role: invite.role });
  markInviteUsed(code);

  const token = createSession(user.id);
  res.status(201).json({
    token,
    user: publicUser(user),
    station: "Antarctica - Station A",
  });
});

export default router;
