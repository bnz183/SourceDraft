import rateLimit from "express-rate-limit";

const RATE_LIMIT_MESSAGE = "Too many requests. Please try again later.";
const DEFAULT_WINDOW_MS = 15 * 60 * 1000;

function isRateLimitRelaxed(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return process.env.STUDIO_RATE_LIMIT_RELAXED?.trim().toLowerCase() === "true";
}

function parseEnvInt(name: string, fallback: number): number {
  const raw = process.env[name]?.trim();
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function resolveMax(max: number): number {
  return isRateLimitRelaxed() ? max * 20 : max;
}

const windowMs = parseEnvInt("SOURCEDRAFT_RATE_LIMIT_WINDOW_MS", DEFAULT_WINDOW_MS);

function createLimiter(max: number) {
  return rateLimit({
    windowMs,
    max: () => resolveMax(max),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({ error: RATE_LIMIT_MESSAGE });
    },
  });
}

/** Baseline protection for every /api route before body parsing. */
export const apiLimiter = createLimiter(600);

/** Login and demo entry — strict to slow brute-force attempts. */
export const strictAuthLimiter = createLimiter(
  parseEnvInt("SOURCEDRAFT_AUTH_RATE_LIMIT_MAX", 5),
);

/** Logout, publish, and media upload — moderate write protection. */
export const writeLimiter = createLimiter(
  parseEnvInt("SOURCEDRAFT_WRITE_RATE_LIMIT_MAX", 60),
);

/** Config, health, posts, and media reads — generous for normal Studio use. */
export const readLimiter = createLimiter(120);
