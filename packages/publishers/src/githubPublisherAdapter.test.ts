import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { githubPublisherFactory } from "./githubPublisherAdapter.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("github publisher adapter", () => {
  it("keeps direct publish behavior unchanged", async () => {
    globalThis.fetch = (async (url: string, init?: RequestInit) => {
      const method = init?.method?.toUpperCase() ?? "GET";

      if (method === "GET" && String(url).includes("/contents/")) {
        return new Response(JSON.stringify({ message: "Not Found" }), { status: 404 });
      }

      if (method === "PUT" && String(url).includes("/contents/")) {
        return new Response(
          JSON.stringify({
            content: { sha: "file-sha" },
            commit: { sha: "commit-sha" },
          }),
          { status: 200 },
        );
      }

      return new Response("unexpected", { status: 500 });
    }) as typeof fetch;

    const publisher = githubPublisherFactory.createPublisher({
      token: "gh-test",
      owner: "acme",
      repo: "blog",
      branch: "main",
      contentDir: "src/content/blog",
      mediaDir: "public/images",
    });

    const result = await publisher.publishArticle({
      path: "src/content/blog/new-post.mdx",
      content: "---\ntitle: Hi\n---\n\nBody",
      message: "Publish: new-post",
      publishMode: "direct",
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.publishMode, "direct");
      assert.equal(result.sha, "file-sha");
      assert.equal(result.commitSha, "commit-sha");
      assert.equal(result.prUrl, undefined);
    }
  });

  it("returns PR metadata for pull-request mode", async () => {
    globalThis.fetch = (async (url: string, init?: RequestInit) => {
      const method = init?.method?.toUpperCase() ?? "GET";
      const target = String(url);

      if (target.includes("/git/ref/heads%2Fmain") || target.endsWith("/git/ref/heads/main")) {
        return new Response(JSON.stringify({ object: { sha: "base-sha" } }), {
          status: 200,
        });
      }

      if (
        target.includes("/git/ref/heads%2Fsourcedraft%2Fnew-post") ||
        target.endsWith("/git/ref/heads/sourcedraft/new-post")
      ) {
        return new Response(JSON.stringify({ message: "Not Found" }), { status: 404 });
      }

      if (target.endsWith("/git/refs") && method === "POST") {
        return new Response(JSON.stringify({ ref: "refs/heads/sourcedraft/new-post" }), {
          status: 201,
        });
      }

      if (target.includes("/contents/") && method === "GET") {
        return new Response(JSON.stringify({ message: "Not Found" }), { status: 404 });
      }

      if (target.includes("/contents/") && method === "PUT") {
        return new Response(
          JSON.stringify({
            content: { sha: "file-sha" },
            commit: { sha: "commit-sha" },
          }),
          { status: 200 },
        );
      }

      if (target.includes("/pulls?")) {
        return new Response(JSON.stringify([]), { status: 200 });
      }

      if (target.endsWith("/pulls") && method === "POST") {
        return new Response(
          JSON.stringify({
            number: 12,
            html_url: "https://github.com/acme/blog/pull/12",
            draft: false,
          }),
          { status: 201 },
        );
      }

      return new Response("unexpected", { status: 500 });
    }) as typeof fetch;

    const publisher = githubPublisherFactory.createPublisher({
      token: "gh-test",
      owner: "acme",
      repo: "blog",
      branch: "main",
      contentDir: "src/content/blog",
      mediaDir: "public/images",
    });

    const result = await publisher.publishArticle({
      path: "src/content/blog/new-post.mdx",
      content: "---\ntitle: Hi\n---\n\nBody",
      message: "Publish: new-post",
      slug: "new-post",
      publishMode: "pull-request",
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.publishMode, "pull-request");
      assert.equal(result.prNumber, 12);
      assert.equal(result.prBranch, "sourcedraft/new-post");
      assert.equal(result.baseBranch, "main");
    }
  });
});
