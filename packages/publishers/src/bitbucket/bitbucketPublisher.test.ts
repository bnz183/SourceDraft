import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createBitbucketPublisher } from "./bitbucketPublisher.js";

type MockResponse = {
  status: number;
  body: string;
};

function mockFetch(handler: (url: string, init?: RequestInit) => MockResponse) {
  return (async (url: string, init?: RequestInit) => {
    const result = handler(url, init);
    return new Response(result.body, { status: result.status });
  }) as typeof fetch;
}

const config = {
  token: "bb-test",
  workspace: "acme",
  repoSlug: "blog",
  branch: "main",
};

describe("Bitbucket publisher", () => {
  it("uploads a text file via commit-upload src API", async () => {
    const publisher = createBitbucketPublisher({
      ...config,
      fetch: mockFetch((url, init) => {
        assert.match(url, /repositories\/acme\/blog\/src$/);
        assert.equal(init?.method, "POST");
        const headers = new Headers(init?.headers);
        assert.equal(headers.get("Content-Type"), "application/x-www-form-urlencoded");
        const body = init?.body?.toString() ?? "";
        assert.match(body, /message=Add\+post/);
        assert.match(body, /branch=main/);
        assert.match(body, /src%2Fcontent%2Fblog%2Fnew-post.mdx=/);

        return {
          status: 201,
          body: JSON.stringify({ hash: "commit-abc" }),
        };
      }),
    });

    const result = await publisher.publishFile({
      path: "src/content/blog/new-post.mdx",
      content: "---\ntitle: Hi\n---\n\nBody",
      message: "Add post",
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.commitSha, "commit-abc");
    }
  });

  it("updates via the same commit-upload endpoint", async () => {
    const publisher = createBitbucketPublisher({
      ...config,
      fetch: mockFetch((_url, init) => {
        const body = init?.body?.toString() ?? "";
        assert.match(body, /updated\+content/);
        return {
          status: 201,
          body: JSON.stringify({ hash: "commit-def" }),
        };
      }),
    });

    const result = await publisher.publishFile({
      path: "src/content/blog/post.mdx",
      content: "updated content",
      message: "Update post",
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.created, true);
    }
  });

  it("returns actionable error on auth failure", async () => {
    const publisher = createBitbucketPublisher({
      ...config,
      fetch: mockFetch(() => ({
        status: 401,
        body: JSON.stringify({ error: { message: "Unauthorized" } }),
      })),
    });

    const result = await publisher.publishFile({
      path: "src/content/blog/post.mdx",
      content: "body",
      message: "Publish",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /BITBUCKET_TOKEN/);
      assert.equal(result.status, 401);
    }
  });

  it("returns actionable error when repository is not found", async () => {
    const publisher = createBitbucketPublisher({
      ...config,
      fetch: mockFetch(() => ({
        status: 404,
        body: JSON.stringify({ error: { message: "Repository not found" } }),
      })),
    });

    const result = await publisher.publishFile({
      path: "src/content/blog/post.mdx",
      content: "body",
      message: "Publish",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /BITBUCKET_WORKSPACE/);
    }
  });

  it("returns actionable error when branch is missing", async () => {
    const publisher = createBitbucketPublisher({
      ...config,
      fetch: mockFetch(() => ({
        status: 400,
        body: JSON.stringify({ error: { message: "Branch main not found" } }),
      })),
    });

    const result = await publisher.publishFile({
      path: "src/content/blog/post.mdx",
      content: "body",
      message: "Publish",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /BITBUCKET_BRANCH/);
    }
  });

  it("treats identical content as a successful no-op", async () => {
    const publisher = createBitbucketPublisher({
      ...config,
      fetch: mockFetch(() => ({
        status: 400,
        body: JSON.stringify({ error: { message: "No changes to commit" } }),
      })),
    });

    const result = await publisher.publishFile({
      path: "src/content/blog/post.mdx",
      content: "same",
      message: "No-op",
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.sha, "unchanged");
    }
  });

  it("uses Basic auth when username is configured", async () => {
    const publisher = createBitbucketPublisher({
      ...config,
      username: "writer",
      fetch: mockFetch((_url, init) => {
        const headers = new Headers(init?.headers);
        const auth = headers.get("Authorization") ?? "";
        assert.match(auth, /^Basic /);
        const decoded = Buffer.from(auth.replace("Basic ", ""), "base64").toString("utf8");
        assert.equal(decoded, "writer:bb-test");
        return { status: 201, body: JSON.stringify({ hash: "commit-basic" }) };
      }),
    });

    const result = await publisher.publishFile({
      path: "src/content/blog/post.mdx",
      content: "body",
      message: "Publish",
    });

    assert.equal(result.ok, true);
  });
});
