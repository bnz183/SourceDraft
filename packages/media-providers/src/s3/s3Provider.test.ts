import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateS3MediaConfig } from "./s3Config.js";
import { createS3MediaProvider } from "./s3Provider.js";

describe("S3-compatible media provider", () => {
  it("validates required config fields", () => {
    const missing = validateS3MediaConfig({});
    assert.equal(missing.ok, false);
    if (!missing.ok) {
      assert.match(missing.error, /S3_ENDPOINT/);
    }

    const valid = validateS3MediaConfig({
      endpoint: "https://account.r2.cloudflarestorage.com",
      region: "auto",
      bucket: "blog-media",
      accessKeyId: "key",
      secretAccessKey: "secret",
      publicBaseUrl: "https://cdn.example.com",
      forcePathStyle: true,
    });

    assert.equal(valid.ok, true);
    if (valid.ok) {
      assert.equal(valid.config.bucket, "blog-media");
      assert.equal(valid.config.forcePathStyle, true);
    }
  });

  it("rejects invalid endpoint URLs", () => {
    const result = validateS3MediaConfig({
      endpoint: "not-a-url",
      region: "auto",
      bucket: "blog-media",
      accessKeyId: "key",
      secretAccessKey: "secret",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /S3_ENDPOINT/);
    }
  });

  it("returns experimental message when config is valid", async () => {
    const provider = createS3MediaProvider({
      endpoint: "https://s3.amazonaws.com",
      region: "us-east-1",
      bucket: "blog-media",
      accessKeyId: "key",
      secretAccessKey: "secret",
    });

    const result = await provider.uploadMedia({
      buffer: Buffer.from("test"),
      filename: "photo.png",
      mimeType: "image/png",
      repoPath: "images/photo.png",
      publicPath: "/images/photo.png",
      message: "Upload",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /experimental/);
    }
  });
});
