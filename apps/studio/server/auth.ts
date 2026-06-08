import { randomBytes, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";

const SESSION_COOKIE = "sourcedraft_session";
/** 24 hours — in-memory MVP sessions, not durable account auth. */
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

type SessionRecord = {
  expiresAt: number;
};

const sessions = new Map<string, SessionRecord>();

function getAdminPassword(): string | null {
  const password = process.env.SOURCEDRAFT_ADMIN_PASSWORD?.trim();
  return password && password.length > 0 ? password : null;
}

function readCookie(req: Request, name: string): string | null {
  const header = req.headers.cookie;
  if (!header) {
    return null;
  }

  for (const part of header.split(";")) {
    const trimmed = part.trim();
    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator);
    if (key === name) {
      return decodeURIComponent(trimmed.slice(separator + 1));
    }
  }

  return null;
}

export function isSecureCookieEnvironment(req: Request): boolean {
  const explicit = process.env.STUDIO_SECURE_COOKIES?.trim().toLowerCase();
  if (explicit === "true") {
    return true;
  }
  if (explicit === "false") {
    return false;
  }

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (typeof forwardedProto === "string") {
    const proto = forwardedProto.split(",")[0]?.trim().toLowerCase();
    if (proto === "https") {
      return true;
    }
  }

  return process.env.NODE_ENV === "production";
}

function buildSessionCookie(
  value: string,
  maxAge: number,
  req: Request,
): string {
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
  ];

  if (isSecureCookieEnvironment(req)) {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function setSessionCookie(req: Request, res: Response, token: string): void {
  const maxAge = Math.floor(SESSION_TTL_MS / 1000);
  res.setHeader("Set-Cookie", buildSessionCookie(token, maxAge, req));
}

function clearSessionCookie(req: Request, res: Response): void {
  res.setHeader("Set-Cookie", buildSessionCookie("", 0, req));
}

function purgeExpiredSessions(): void {
  const now = Date.now();
  for (const [token, session] of sessions) {
    if (session.expiresAt <= now) {
      sessions.delete(token);
    }
  }
}

export function isAuthConfigured(): boolean {
  return getAdminPassword() !== null;
}

export function verifyPassword(password: string): boolean {
  const expected = getAdminPassword();
  if (expected === null) {
    return false;
  }

  const provided = Buffer.from(password);
  const target = Buffer.from(expected);

  if (provided.length !== target.length) {
    return false;
  }

  return timingSafeEqual(provided, target);
}

export function createSession(): string {
  purgeExpiredSessions();
  const token = randomBytes(32).toString("hex");
  sessions.set(token, { expiresAt: Date.now() + SESSION_TTL_MS });
  return token;
}

export function destroySession(token: string | null): void {
  if (token) {
    sessions.delete(token);
  }
}

export function isSessionValid(token: string | null): boolean {
  if (!token) {
    return false;
  }

  purgeExpiredSessions();
  const session = sessions.get(token);
  if (!session) {
    return false;
  }

  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return false;
  }

  return true;
}

export function getSessionToken(req: Request): string | null {
  return readCookie(req, SESSION_COOKIE);
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!isAuthConfigured()) {
    res.status(500).json({
      ok: false,
      error: "SOURCEDRAFT_ADMIN_PASSWORD is not configured.",
    });
    return;
  }

  const token = getSessionToken(req);
  if (!isSessionValid(token)) {
    res.status(401).json({ ok: false, error: "Authentication required." });
    return;
  }

  next();
}

export function login(
  req: Request,
  password: string,
  res: Response,
): { ok: boolean; error?: string } {
  if (!isAuthConfigured()) {
    return { ok: false, error: "Studio auth is not configured." };
  }

  if (!verifyPassword(password)) {
    return { ok: false, error: "Invalid password." };
  }

  const token = createSession();
  setSessionCookie(req, res, token);
  return { ok: true };
}

export function logout(req: Request, res: Response): void {
  destroySession(getSessionToken(req));
  clearSessionCookie(req, res);
}
