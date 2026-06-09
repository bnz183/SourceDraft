import rateLimit from "express-rate-limit";

const RATE_LIMIT_MESSAGE = "Too many requests. Try again later.";

function isRateLimitRelaxed(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  return process.env.STUDIO_RATE_LIMIT_RELAXED?.trim().toLowerCase() === "true";
}

function resolveMax(max: number): number {
  return isRateLimitRelaxed() ? max * 20 : max;
}

function createLimiter(max: number, windowMs: number) {
  return rateLimit({
    windowMs,
    max: () => resolveMax(max),
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({ ok: false, error: RATE_LIMIT_MESSAGE });
    },
  });
}

/** Login and demo entry — strict to slow brute-force attempts. */
export const strictAuthLimiter = createLimiter(10, 15 * 60 * 1000);

/** Logout, publish, and media upload — moderate write protection. */
export const writeLimiter = createLimiter(60, 15 * 60 * 1000);

/** Config, health, posts, and media reads — generous for normal Studio use. */
export const readLimiter = createLimiter(300, 15 * 60 * 1000);
