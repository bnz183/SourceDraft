import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";
import {
  buildCloudinarySignature,
  serializeCloudinarySignatureParams,
} from "./cloudinarySignature.js";

describe("cloudinary signature", () => {
  it("serializes params in sorted order", () => {
    const serialized = serializeCloudinarySignatureParams({
      timestamp: 1_700_000_000,
      folder: "sourcedraft",
    });

    assert.equal(serialized, "folder=sourcedraft&timestamp=1700000000");
  });

  it("builds deterministic SHA-256 signatures", () => {
    const params = {
      timestamp: 1_700_000_000,
      folder: "sourcedraft",
    };
    const apiSecret = "secret456";
    const serialized = serializeCloudinarySignatureParams(params);
    const expected = createHash("sha256")
      .update(`${serialized}${apiSecret}`)
      .digest("hex");

    assert.equal(buildCloudinarySignature(params, apiSecret), expected);
    assert.equal(
      expected,
      "19b24d26130786a58ef8371151d9559bbb54c4044ed58226a507ef4f4a129f7f",
    );
  });
});
