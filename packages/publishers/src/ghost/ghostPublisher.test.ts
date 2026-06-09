import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CmsArticlePayload } from "../types.js";
import { createGhostPublisher } from "./ghostPublisher.js";

const TEST_KEY_ID = "abc123";
const TEST_SECRET_HEX = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";
const TEST_API_KEY = `${TEST_KEY_ID}:${TEST_SECRET_HEX}`;

const article: CmsArticlePayload = {
  title: "Hello Ghost",
  slug: "hello-ghost",
  description: "Short excerpt",
  body: "<p>Hello Ghost</p>",
  pubDate: "2026-06-08T10:00:00.000Z",
  category: "Guides",
  tags: ["cms"],
  draft: true,
  metaTitle: "Meta title",
  metaDescription: "Meta description",
  canonicalUrl: "https://example.com/hello-ghost/",
  heroImage: "https://example.com/images/hero.jpg",
};

const config = {
  adminUrl: "https://example.com",
  adminApiKey: TEST_API_KEY,
  acceptVersion: "v5.126",
  defaultStatus: "draft",
};

function requestMethod(init?: RequestInit): string {
  return init?.method?.toUpperCase() ?? "GET";
}

describe("Ghost publisher", () => {
  it("creates a draft post with JWT auth and source=html", async () => {
    const publisher = createGhostPublisher({
      ...config,
      fetch: async (url, init) => {
        assert.equal(url, "https://example.com/ghost/api/admin/posts/?source=html");
        assert.equal(requestMethod(init), "POST");

        const headers = new Headers(init?.headers);
        assert.match(headers.get("Authorization") ?? "", /^Ghost /);
        assert.equal(headers.get("Accept-Version"), "v5.126");

        const body = JSON.parse(init?.body?.toString() ?? "{}");
        const post = body.posts[0];
        assert.equal(post.title, article.title);
        assert.equal(post.slug, article.slug);
        assert.equal(post.status, "draft");
        assert.equal(post.html, article.body);
        assert.equal(post.feature_image, article.heroImage);
        assert.equal(post.meta_title, article.metaTitle);

        return new Response(
          JSON.stringify({
            posts: [{ id: "ghost-uuid-1", slug: "hello-ghost", status: "draft" }],
          }),
          { status: 201 },
        );
      },
    });

    const result = await publisher.publishPost({ article });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.created, true);
      assert.equal(result.remoteId, "ghost-uuid-1");
    }
  });

  it("updates an existing post when remoteId is provided", async () => {
    const publisher = createGhostPublisher({
      ...config,
      fetch: async (url, init) => {
        assert.match(url, /\/ghost\/api\/admin\/posts\/ghost-uuid-1\/\?source=html$/);
        assert.equal(requestMethod(init), "PUT");
        return new Response(
          JSON.stringify({
            posts: [{ id: "ghost-uuid-1", slug: "hello-ghost" }],
          }),
          { status: 200 },
        );
      },
    });

    const result = await publisher.publishPost({ article, remoteId: "ghost-uuid-1" });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.created, false);
    }
  });

  it("returns actionable error on auth failure", async () => {
    const publisher = createGhostPublisher({
      ...config,
      fetch: async () =>
        new Response(JSON.stringify({ errors: [{ message: "Authorization failed" }] }), {
          status: 403,
        }),
    });

    const result = await publisher.publishPost({ article });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /GHOST_ADMIN_API_KEY/);
    }
  });

  it("returns actionable error on invalid endpoint", async () => {
    const publisher = createGhostPublisher({
      ...config,
      fetch: async () =>
        new Response(JSON.stringify({ errors: [{ message: "Not found" }] }), { status: 404 }),
    });

    const result = await publisher.publishPost({ article });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /GHOST_ADMIN_URL/);
    }
  });
});
