import { randomBytes } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import {
  isDemoModeAvailable,
  isDemoModeForced,
  isPublisherConfigured,
} from "./demoMode.js";
import {
  verifyPassword as verifyStoredPassword,
  verifyPlaintextPassword,
} from "./adminPassword.js";

export const AUTH_FAILURE_MESSAGE = "Authentication failed.";

const SESSION_COOKIE = "sourcedraft_session";
/** 24 hours — in-memory MVP sessions, not durable account auth. */
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

type SessionRecord = {
  expiresAt: number;
  demo?: boolean;
};

const sessions = new Map<string, SessionRecord>();

function getAdminPasswordHash(): string | null {
  const hash = process.env.SOURCEDRAFT_ADMIN_PASSWORD_HASH?.trim();
  return hash && hash.length > 0 ? hash : null;
}

function getLegacyAdminPassword(): string | null {
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
  return getAdminPasswordHash() !== null || getLegacyAdminPassword() !== null;
}

export async function verifyPassword(password: string): Promise<boolean> {
  if (password.length === 0) {
    return false;
  }

  const hash = getAdminPasswordHash();
  if (hash !== null) {
    return verifyStoredPassword(password, hash);
  }

  const legacyPassword = getLegacyAdminPassword();
  if (legacyPassword === null) {
    return false;
  }

  return verifyPlaintextPassword(password, legacyPassword);
}

export function createSession(options?: { demo?: boolean }): string {
  purgeExpiredSessions();
  const token = randomBytes(32).toString("hex");
  sessions.set(token, {
    expiresAt: Date.now() + SESSION_TTL_MS,
    demo: options?.demo === true,
  });
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

export function isDemoSession(token: string | null): boolean {
  if (!token) {
    return false;
  }

  purgeExpiredSessions();
  const session = sessions.get(token);
  return session?.demo === true;
}

export function isRequestDemoSession(req: Request): boolean {
  if (isDemoModeForced() || !isPublisherConfigured()) {
    return true;
  }

  return isDemoSession(getSessionToken(req));
}

export function isAuthenticatedDemoActive(req: Request): boolean {
  const token = getSessionToken(req);
  if (!isSessionValid(token)) {
    return false;
  }

  return isRequestDemoSession(req);
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = getSessionToken(req);
  if (isSessionValid(token)) {
    next();
    return;
  }

  if (!isAuthConfigured() && !isDemoModeAvailable()) {
    res.status(500).json({
      ok: false,
      error:
        "Studio auth is not configured. Set SOURCEDRAFT_ADMIN_PASSWORD_HASH or SOURCEDRAFT_ADMIN_PASSWORD.",
    });
    return;
  }

  res.status(401).json({ ok: false, error: "Authentication required." });
}

/**
 * A request is a "hard" demo request when the deployment is forced into demo
 * mode or the session itself was created through demo entry. This is stricter
 * than {@link isRequestDemoSession}: a real (non-demo) authenticated user whose
 * publisher is not configured yet is NOT treated as demo, so they can still run
 * legitimate setup writes such as config generation.
 */
export function isHardDemoRequest(req: Request): boolean {
  return isDemoModeForced() || isDemoSession(getSessionToken(req));
}

/**
 * Guards routes that mutate real files or configuration. Demo mode must stay
 * read/demo-only, so demo sessions (and forced-demo deployments) are rejected
 * before any real write happens. Pair with {@link requireAuth}, which rejects
 * unauthenticated requests first.
 */
export function requireNonDemo(req: Request, res: Response, next: NextFunction): void {
  if (isHardDemoRequest(req)) {
    res.status(403).json({
      ok: false,
      error:
        "This action is disabled in demo mode. Demo mode never changes real files or configuration.",
    });
    return;
  }

  next();
}

export async function login(
  req: Request,
  password: string,
  res: Response,
): Promise<{ ok: boolean; error?: string; status?: number }> {
  if (!isAuthConfigured()) {
    return { ok: false, error: AUTH_FAILURE_MESSAGE, status: 401 };
  }

  if (!(await verifyPassword(password))) {
    return { ok: false, error: AUTH_FAILURE_MESSAGE, status: 401 };
  }

  const token = createSession();
  setSessionCookie(req, res, token);
  return { ok: true };
}

export function enterDemo(
  req: Request,
  res: Response,
): { ok: boolean; error?: string } {
  if (!isDemoModeAvailable()) {
    return {
      ok: false,
      error: "Demo mode is disabled on this Studio instance.",
    };
  }

  const token = createSession({ demo: true });
  setSessionCookie(req, res, token);
  return { ok: true };
}

export function logout(req: Request, res: Response): void {
  destroySession(getSessionToken(req));
  clearSessionCookie(req, res);
}
