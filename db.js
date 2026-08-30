import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "data", "polargrid.db");

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'researcher', 'emergency')),
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS invites (
    code TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'researcher', 'emergency')),
    invited_by TEXT,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL,
    used_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`);

// Seed a single default admin on first run only, so there's someone who can
// issue the first invites. Change this password immediately in a real
// deployment (see README).
const userCount = db.prepare("SELECT COUNT(*) AS n FROM users").get().n;
if (userCount === 0) {
  const id = "usr_" + Math.random().toString(36).slice(2);
  const hash = bcrypt.hashSync("polar2026", 10);
  db.prepare(
    "INSERT INTO users (id, email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, "admin@polarstation.org", hash, "R. Kessler", "admin", Date.now());
  console.log(
    "Seeded initial admin account: admin@polarstation.org / polar2026 (change this password)"
  );
}

export function findUserByEmail(email) {
  return db
    .prepare("SELECT * FROM users WHERE lower(email) = lower(?)")
    .get(email);
}

export function findUserById(id) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}

export function createUser({ email, password, name, role }) {
  const id = "usr_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  const hash = bcrypt.hashSync(password, 10);
  db.prepare(
    "INSERT INTO users (id, email, password_hash, name, role, created_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(id, email, hash, name, role, Date.now());
  return findUserById(id);
}

export function createInvite({ email, role, invitedBy, code, ttlMs }) {
  const now = Date.now();
  db.prepare(
    "INSERT INTO invites (code, email, role, invited_by, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(code, email, role, invitedBy, now, now + ttlMs);
  return db.prepare("SELECT * FROM invites WHERE code = ?").get(code);
}

export function findInvite(code) {
  return db.prepare("SELECT * FROM invites WHERE code = ?").get(code);
}

export function markInviteUsed(code) {
  db.prepare("UPDATE invites SET used_at = ? WHERE code = ?").run(Date.now(), code);
}

export function listInvites() {
  return db
    .prepare("SELECT * FROM invites ORDER BY created_at DESC")
    .all();
}

export function createSession(userId) {
  const token = "pg_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  db.prepare("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)").run(
    token,
    userId,
    Date.now()
  );
  return token;
}

export function findSession(token) {
  return db.prepare("SELECT * FROM sessions WHERE token = ?").get(token);
}

export function deleteSession(token) {
  db.prepare("DELETE FROM sessions WHERE token = ?").run(token);
}
