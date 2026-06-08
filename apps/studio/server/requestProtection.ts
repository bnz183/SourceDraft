import type { NextFunction, Request, Response } from "express";

const ALLOWED_SEC_FETCH_SITE = new Set(["same-origin", "same-site", "none"]);

function readHeader(req: Request, name: string): string | null {
  const value = req.headers[name];
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  return value.trim().toLowerCase();
}

function originFromReferer(referer: string): string | null {
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

function isLoopbackHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function isLocalPrivateHost(req: Request): boolean {
  const hostname = req.headers.host?.split(":")[0] ?? "";
  return isLoopbackHostname(hostname);
}

function configuredAllowedOrigins(): string[] {
  const raw = process.env.STUDIO_ALLOWED_ORIGINS?.trim();
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function isAllowedRequestOrigin(req: Request, origin: string): boolean {
  const allowed = configuredAllowedOrigins();
  if (allowed.length > 0) {
    return allowed.includes(origin);
  }

  try {
    const originUrl = new URL(origin);

    if (isLoopbackHostname(originUrl.hostname) && isLocalPrivateHost(req)) {
      return true;
    }

    const host = req.headers.host ?? "";
    const requestHostname = host.split(":")[0] ?? "";
    return originUrl.hostname === requestHostname;
  } catch {
    return false;
  }
}

/**
 * MVP hardening for state-changing routes.
 * Blocks obvious cross-site POSTs using Fetch Metadata and Origin/Referer checks.
 * This is not full hosted-SaaS CSRF protection — keep Studio local/private unless
 * deployed behind HTTPS with stronger auth and deployment hardening.
 */
export function requireSameSiteRequest(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const secFetchSite = readHeader(req, "sec-fetch-site");
  if (secFetchSite !== null) {
    if (!ALLOWED_SEC_FETCH_SITE.has(secFetchSite)) {
      res.status(403).json({ ok: false, error: "Cross-site request blocked." });
      return;
    }

    next();
    return;
  }

  const originHeader = req.headers.origin;
  const refererHeader = req.headers.referer;
  const origin =
    typeof originHeader === "string" && originHeader.length > 0
      ? originHeader
      : typeof refererHeader === "string"
        ? originFromReferer(refererHeader)
        : null;

  if (origin === null) {
    if (isLocalPrivateHost(req)) {
      next();
      return;
    }

    res.status(403).json({ ok: false, error: "Origin verification required." });
    return;
  }

  if (!isAllowedRequestOrigin(req, origin)) {
    res.status(403).json({ ok: false, error: "Cross-site request blocked." });
    return;
  }

  next();
}
