import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createCloudinaryMediaProvider } from "./cloudinaryProvider.js";

const config = {
  cloudName: "demo",
  apiKey: "key123",
  apiSecret: "secret456",
  folder: "sourcedraft",
};

describe("Cloudinary media provider", () => {
  it("uploads an image and returns secure URL", async () => {
    const provider = createCloudinaryMediaProvider({
      ...config,
      fetch: async (url, init) => {
        assert.match(url, /api\.cloudinary\.com\/v1_1\/demo\/image\/upload$/);
        assert.equal(init?.method, "POST");
        const body = init?.body;
        assert.ok(body instanceof FormData);
        assert.equal(body.get("api_key"), "key123");
        assert.equal(body.get("folder"), "sourcedraft");
        assert.ok(typeof body.get("signature") === "string");

        return new Response(
          JSON.stringify({
            secure_url: "https://res.cloudinary.com/demo/image/upload/v1/sourcedraft/photo.png",
            public_id: "sourcedraft/photo",
            format: "png",
            bytes: 1024,
          }),
          { status: 200 },
        );
      },
    });

    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
    const result = await provider.uploadMedia({
      buffer: png,
      filename: "photo.png",
      mimeType: "image/png",
      repoPath: "public/images/photo.png",
      publicPath: "/images/photo.png",
      message: "Upload",
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.provider, "cloudinary");
      assert.match(result.url, /^https:\/\/res\.cloudinary\.com\//);
      assert.equal(result.path, "sourcedraft/photo");
    }
  });

  it("rejects unsupported file types", async () => {
    const provider = createCloudinaryMediaProvider(config);
    const result = await provider.uploadMedia({
      buffer: Buffer.from("%PDF"),
      filename: "doc.pdf",
      mimeType: "application/pdf",
      repoPath: "public/images/doc.pdf",
      publicPath: "/images/doc.pdf",
      message: "Upload",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /Cloudinary media provider supports/);
    }
  });

  it("returns actionable error on auth failure", async () => {
    const provider = createCloudinaryMediaProvider({
      ...config,
      fetch: async () =>
        new Response(JSON.stringify({ error: { message: "Invalid credentials" } }), {
          status: 401,
        }),
    });

    const result = await provider.uploadMedia({
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
      filename: "photo.png",
      mimeType: "image/png",
      repoPath: "public/images/photo.png",
      publicPath: "/images/photo.png",
      message: "Upload",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /CLOUDINARY_API_KEY/);
    }
  });
});
