import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import type { NextFunction, Request, Response } from "express";
import {
  createSession,
  isHardDemoRequest,
  isRequestDemoSession,
  requireNonDemo,
} from "./auth.js";

const SESSION_COOKIE = "sourcedraft_session";
const ENV_KEYS = [
  "SOURCEDRAFT_DEMO_MODE",
  "CMS_PUBLISHER",
  "GITHUB_TOKEN",
  "GITHUB_OWNER",
  "GITHUB_REPO",
] as const;

const original = new Map<string, string | undefined>();

function mockRequest(cookie?: string): Request {
  return { headers: cookie ? { cookie } : {} } as Request;
}

function mockResponse() {
  const result: { statusCode?: number; body?: { ok?: boolean; error?: string } } =
    {};
  const res = {
    status(code: number) {
      result.statusCode = code;
      return this;
    },
    json(payload: { ok?: boolean; error?: string }) {
      result.body = payload;
      return this;
    },
  } as unknown as Response;
  return { res, result };
}

function run(req: Request) {
  const { res, result } = mockResponse();
  let nextCalled = false;
  const next: NextFunction = () => {
    nextCalled = true;
  };
  requireNonDemo(req, res, next);
  return { nextCalled, result };
}

describe("requireNonDemo", () => {
  afterEach(() => {
    for (const key of ENV_KEYS) {
      const value = original.get(key);
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
    original.clear();
  });

  function clearEnv(): void {
    for (const key of ENV_KEYS) {
      original.set(key, process.env[key]);
      delete process.env[key];
    }
  }

  it("rejects forced demo deployments before any real write", () => {
    clearEnv();
    process.env.SOURCEDRAFT_DEMO_MODE = "true";

    const { nextCalled, result } = run(mockRequest());
    assert.equal(nextCalled, false);
    assert.equal(result.statusCode, 403);
    assert.equal(result.body?.ok, false);
  });

  it("rejects demo sessions", () => {
    clearEnv();
    const token = createSession({ demo: true });

    const { nextCalled, result } = run(mockRequest(`${SESSION_COOKIE}=${token}`));
    assert.equal(nextCalled, false);
    assert.equal(result.statusCode, 403);
  });

  it("allows a real authenticated session even before a publisher is configured", () => {
    clearEnv();
    const token = createSession();
    const req = mockRequest(`${SESSION_COOKIE}=${token}`);

    // With no publisher configured, the broad demo-routing check still reports
    // demo for read fallbacks, but the write guard must NOT block a real user
    // who is trying to set up their config.
    assert.equal(isRequestDemoSession(req), true);
    assert.equal(isHardDemoRequest(req), false);

    const { nextCalled, result } = run(req);
    assert.equal(nextCalled, true);
    assert.equal(result.statusCode, undefined);
  });
});
