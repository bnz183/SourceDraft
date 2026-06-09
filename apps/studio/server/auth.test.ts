import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { hashAdminPassword } from "./adminPassword.js";
import { isAuthConfigured, verifyPassword } from "./auth.js";

const ENV_KEYS = [
  "SOURCEDRAFT_ADMIN_PASSWORD_HASH",
  "SOURCEDRAFT_ADMIN_PASSWORD",
] as const;

const originalEnv = new Map<string, string | undefined>();

function saveEnv(): void {
  for (const key of ENV_KEYS) {
    originalEnv.set(key, process.env[key]);
  }
}

function restoreEnv(): void {
  for (const key of ENV_KEYS) {
    const value = originalEnv.get(key);
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

function clearAuthEnv(): void {
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
}

describe("studio auth", () => {
  afterEach(() => {
    restoreEnv();
  });

  it("accepts valid scrypt hash login and prefers hash over plaintext", () => {
    saveEnv();
    clearAuthEnv();

    const hash = hashAdminPassword("studio-secret");
    process.env.SOURCEDRAFT_ADMIN_PASSWORD_HASH = hash;
    process.env.SOURCEDRAFT_ADMIN_PASSWORD = "legacy-only";

    assert.equal(isAuthConfigured(), true);
    assert.equal(verifyPassword("studio-secret"), true);
    assert.equal(verifyPassword("legacy-only"), false);
    assert.equal(verifyPassword("wrong"), false);
  });

  it("rejects invalid scrypt hash login", () => {
    saveEnv();
    clearAuthEnv();

    process.env.SOURCEDRAFT_ADMIN_PASSWORD_HASH = "scrypt$16384$8$1$invalid$invalid";

    assert.equal(isAuthConfigured(), true);
    assert.equal(verifyPassword("anything"), false);
  });

  it("falls back to legacy plaintext password when hash is absent", () => {
    saveEnv();
    clearAuthEnv();

    process.env.SOURCEDRAFT_ADMIN_PASSWORD = "legacy-password";

    assert.equal(isAuthConfigured(), true);
    assert.equal(verifyPassword("legacy-password"), true);
    assert.equal(verifyPassword("other"), false);
  });

  it("reports missing auth config when no password values are set", () => {
    saveEnv();
    clearAuthEnv();

    assert.equal(isAuthConfigured(), false);
    assert.equal(verifyPassword("anything"), false);
  });
});
