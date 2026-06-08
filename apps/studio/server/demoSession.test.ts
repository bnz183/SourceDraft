import assert from "node:assert/strict";
import { describe, it, afterEach } from "node:test";
import type { Request } from "express";
import {
  isAuthenticatedDemoActive,
  isRequestDemoSession,
} from "./auth.js";

function mockRequest(cookie?: string): Request {
  return {
    headers: cookie ? { cookie } : {},
  } as Request;
}

describe("demo session guards", () => {
  const originalDemoMode = process.env.SOURCEDRAFT_DEMO_MODE;
  const originalToken = process.env.GITHUB_TOKEN;
  const originalOwner = process.env.GITHUB_OWNER;
  const originalRepo = process.env.GITHUB_REPO;

  afterEach(() => {
    if (originalDemoMode === undefined) {
      delete process.env.SOURCEDRAFT_DEMO_MODE;
    } else {
      process.env.SOURCEDRAFT_DEMO_MODE = originalDemoMode;
    }
    if (originalToken === undefined) {
      delete process.env.GITHUB_TOKEN;
    } else {
      process.env.GITHUB_TOKEN = originalToken;
    }
    if (originalOwner === undefined) {
      delete process.env.GITHUB_OWNER;
    } else {
      process.env.GITHUB_OWNER = originalOwner;
    }
    if (originalRepo === undefined) {
      delete process.env.GITHUB_REPO;
    } else {
      process.env.GITHUB_REPO = originalRepo;
    }
  });

  it("treats forced demo mode as active for authenticated demo routing", () => {
    process.env.SOURCEDRAFT_DEMO_MODE = "true";
    process.env.GITHUB_TOKEN = "ghp_test";
    process.env.GITHUB_OWNER = "owner";
    process.env.GITHUB_REPO = "repo";

    assert.equal(isRequestDemoSession(mockRequest()), true);
  });

  it("does not report demo active on auth status when unauthenticated", () => {
    process.env.SOURCEDRAFT_DEMO_MODE = "true";
    process.env.GITHUB_TOKEN = "ghp_test";
    process.env.GITHUB_OWNER = "owner";
    process.env.GITHUB_REPO = "repo";

    assert.equal(isAuthenticatedDemoActive(mockRequest()), false);
  });
});
