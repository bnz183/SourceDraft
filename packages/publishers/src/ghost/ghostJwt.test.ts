import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { describe, it } from "node:test";
import { createGhostAdminJwt, parseGhostAdminApiKey } from "./ghostJwt.js";

const TEST_KEY_ID = "abc123";
const TEST_SECRET_HEX = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";
const TEST_API_KEY = `${TEST_KEY_ID}:${TEST_SECRET_HEX}`;

describe("Ghost JWT", () => {
  it("parses a valid Admin API key", () => {
    const parsed = parseGhostAdminApiKey(TEST_API_KEY);
    assert.equal("ok" in parsed, false);
    if (!("ok" in parsed)) {
      assert.equal(parsed.id, TEST_KEY_ID);
      assert.equal(parsed.secret.length > 0, true);
    }
  });

  it("rejects malformed Admin API keys", () => {
    const parsed = parseGhostAdminApiKey("not-a-valid-key");
    assert.equal(parsed.ok, false);
  });

  it("generates a JWT with the expected header and signature", () => {
    const now = 1_700_000_000;
    const result = createGhostAdminJwt(TEST_API_KEY, now);
    assert.equal("ok" in result, false);

    if ("ok" in result) {
      return;
    }

    const [header, payload, signature] = result.token.split(".");
    assert.ok(header);
    assert.ok(payload);
    assert.ok(signature);

    const decodedHeader = JSON.parse(Buffer.from(header, "base64url").toString("utf8"));
    assert.equal(decodedHeader.alg, "HS256");
    assert.equal(decodedHeader.kid, TEST_KEY_ID);

    const decodedPayload = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    assert.equal(decodedPayload.iat, now);
    assert.equal(decodedPayload.exp, now + 300);
    assert.equal(decodedPayload.aud, "/admin/");

    const expectedSignature = createHmac("sha256", Buffer.from(TEST_SECRET_HEX, "hex"))
      .update(`${header}.${payload}`)
      .digest("base64url");
    assert.equal(signature, expectedSignature);
  });
});
