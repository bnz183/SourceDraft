import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  hashAdminPassword,
  hashPassword,
  hashScryptPassword,
  isArgon2PasswordHash,
  verifyPassword,
} from "./adminPassword.js";
import { AUTH_FAILURE_MESSAGE, isAuthConfigured, verifyPassword as verifyAuthPassword } from "./auth.js";

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

  it("accepts valid argon2 hash login and prefers hash over plaintext", async () => {
    saveEnv();
    clearAuthEnv();

    const hash = await hashAdminPassword("studio-secret");
    assert.equal(isArgon2PasswordHash(hash), true);
    process.env.SOURCEDRAFT_ADMIN_PASSWORD_HASH = hash;
    process.env.SOURCEDRAFT_ADMIN_PASSWORD = "legacy-only";

    assert.equal(isAuthConfigured(), true);
    assert.equal(await verifyAuthPassword("studio-secret"), true);
    assert.equal(await verifyAuthPassword("legacy-only"), false);
    assert.equal(await verifyAuthPassword("wrong"), false);
  });

  it("accepts legacy scrypt hash login", async () => {
    saveEnv();
    clearAuthEnv();

    const hash = hashScryptPassword("studio-secret");
    process.env.SOURCEDRAFT_ADMIN_PASSWORD_HASH = hash;

    assert.equal(isAuthConfigured(), true);
    assert.equal(await verifyAuthPassword("studio-secret"), true);
    assert.equal(await verifyAuthPassword("wrong"), false);
  });

  it("rejects invalid hash login", async () => {
    saveEnv();
    clearAuthEnv();

    process.env.SOURCEDRAFT_ADMIN_PASSWORD_HASH = "scrypt$16384$8$1$invalid$invalid";

    assert.equal(isAuthConfigured(), true);
    assert.equal(await verifyAuthPassword("anything"), false);
  });

  it("falls back to legacy plaintext password when hash is absent", async () => {
    saveEnv();
    clearAuthEnv();

    process.env.SOURCEDRAFT_ADMIN_PASSWORD = "legacy-password";

    assert.equal(isAuthConfigured(), true);
    assert.equal(await verifyAuthPassword("legacy-password"), true);
    assert.equal(await verifyAuthPassword("other"), false);
  });

  it("reports missing auth config when no password values are set", async () => {
    saveEnv();
    clearAuthEnv();

    assert.equal(isAuthConfigured(), false);
    assert.equal(await verifyAuthPassword("anything"), false);
  });

  it("uses a generic authentication failure message", () => {
    assert.equal(AUTH_FAILURE_MESSAGE, "Authentication failed.");
  });
});

describe("admin password hashing", () => {
  it("stores argon2id hashes instead of plaintext", async () => {
    const hash = await hashPassword("studio-secret");
    assert.match(hash, /^\$argon2id\$/);
    assert.notEqual(hash, "studio-secret");
  });

  it("verifies correct and incorrect passwords", async () => {
    const hash = await hashPassword("studio-secret");
    assert.equal(await verifyPassword("studio-secret", hash), true);
    assert.equal(await verifyPassword("wrong", hash), false);
  });

  it("rejects empty passwords", async () => {
    const hash = await hashPassword("studio-secret");
    assert.equal(await verifyPassword("", hash), false);
    await assert.rejects(() => hashPassword(""), /Password must not be empty/);
  });
});
