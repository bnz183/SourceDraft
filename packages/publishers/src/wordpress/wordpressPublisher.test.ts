import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { CmsArticlePayload } from "../types.js";
import { createWordPressPublisher } from "./wordpressPublisher.js";

const article: CmsArticlePayload = {
  title: "Hello WordPress",
  slug: "hello-wordpress",
  description: "Short excerpt",
  body: "## Hello\n\nMarkdown body.",
  pubDate: "2026-06-08T10:00:00.000Z",
  category: "Guides",
  tags: ["cms", "test"],
  draft: true,
};

const config = {
  apiUrl: "https://example.com/wp-json",
  username: "editor",
  appPassword: "abcd EFGH ijkl MNOP qrst UVWX",
  defaultStatus: "draft",
  categoryIds: { Guides: 3 },
  tagIds: { cms: 10, test: 11 },
};

function requestMethod(init?: RequestInit): string {
  return init?.method?.toUpperCase() ?? "GET";
}

describe("WordPress publisher", () => {
  it("creates a draft post with application password auth", async () => {
    const publisher = createWordPressPublisher({
      ...config,
      fetch: async (url, init) => {
        assert.equal(url, "https://example.com/wp-json/wp/v2/posts");
        assert.equal(requestMethod(init), "POST");

        const headers = new Headers(init?.headers);
        const auth = headers.get("Authorization") ?? "";
        assert.match(auth, /^Basic /);
        const decoded = Buffer.from(auth.replace("Basic ", ""), "base64").toString("utf8");
        assert.equal(decoded, `${config.username}:${config.appPassword}`);

        const body = JSON.parse(init?.body?.toString() ?? "{}");
        assert.equal(body.title, article.title);
        assert.equal(body.slug, article.slug);
        assert.equal(body.status, "draft");
        assert.equal(body.excerpt, article.description);
        assert.deepEqual(body.categories, [3]);
        assert.deepEqual(body.tags, [10, 11]);

        return new Response(
          JSON.stringify({ id: 42, slug: "hello-wordpress", status: "draft" }),
          { status: 201 },
        );
      },
    });

    const result = await publisher.publishPost({ article });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.created, true);
      assert.equal(result.remoteId, "42");
      assert.equal(result.path, "hello-wordpress");
    }
  });

  it("updates an existing post when remoteId is provided", async () => {
    const publisher = createWordPressPublisher({
      ...config,
      fetch: async (url, init) => {
        assert.equal(url, "https://example.com/wp-json/wp/v2/posts/42");
        assert.equal(requestMethod(init), "POST");
        return new Response(JSON.stringify({ id: 42, slug: "hello-wordpress" }), {
          status: 200,
        });
      },
    });

    const result = await publisher.publishPost({ article, remoteId: "42" });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.created, false);
      assert.equal(result.remoteId, "42");
    }
  });

  it("uses publish status when article is not a draft", async () => {
    const publisher = createWordPressPublisher({
      ...config,
      defaultStatus: "publish",
      fetch: async (_url, init) => {
        const body = JSON.parse(init?.body?.toString() ?? "{}");
        assert.equal(body.status, "publish");
        return new Response(JSON.stringify({ id: 7, slug: "live-post" }), { status: 201 });
      },
    });

    const result = await publisher.publishPost({
      article: { ...article, draft: false, slug: "live-post" },
    });

    assert.equal(result.ok, true);
  });

  it("returns actionable error on auth failure", async () => {
    const publisher = createWordPressPublisher({
      ...config,
      fetch: async () =>
        new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 }),
    });

    const result = await publisher.publishPost({ article });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /WORDPRESS_USERNAME/);
    }
  });

  it("returns actionable error on invalid endpoint", async () => {
    const publisher = createWordPressPublisher({
      ...config,
      fetch: async () =>
        new Response(JSON.stringify({ message: "Not found" }), { status: 404 }),
    });

    const result = await publisher.publishPost({ article });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /WORDPRESS_API_URL/);
    }
  });
});
