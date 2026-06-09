import assert from "node:assert/strict";
import express from "express";
import { describe, it } from "node:test";
import { strictAuthLimiter } from "./rateLimit.js";

describe("rate limiting", () => {
  it("returns the standard 429 JSON error payload", async () => {
    const previousNodeEnv = process.env.NODE_ENV;
    const previousRelaxed = process.env.STUDIO_RATE_LIMIT_RELAXED;
    process.env.NODE_ENV = "production";
    delete process.env.STUDIO_RATE_LIMIT_RELAXED;

    try {
      const app = express();
      app.post("/api/auth/login", strictAuthLimiter, (_req, res) => {
        res.json({ ok: true });
      });

      const server = app.listen(0);
      const address = server.address();
      if (!address || typeof address === "string") {
        throw new Error("Failed to bind test server.");
      }

      const baseUrl = `http://127.0.0.1:${address.port}`;
      let blockedBody: { ok: boolean; error: string } | null = null;

      for (let attempt = 0; attempt < 12; attempt += 1) {
        const response = await fetch(`${baseUrl}/api/auth/login`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: "{}",
        });

        if (response.status === 429) {
          blockedBody = (await response.json()) as { ok: boolean; error: string };
          break;
        }
      }

      await new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      });

      assert.ok(blockedBody);
      assert.equal(blockedBody?.ok, false);
      assert.equal(blockedBody?.error, "Too many requests. Try again later.");
    } finally {
      if (previousNodeEnv === undefined) {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = previousNodeEnv;
      }

      if (previousRelaxed === undefined) {
        delete process.env.STUDIO_RATE_LIMIT_RELAXED;
      } else {
        process.env.STUDIO_RATE_LIMIT_RELAXED = previousRelaxed;
      }
    }
  });
});
