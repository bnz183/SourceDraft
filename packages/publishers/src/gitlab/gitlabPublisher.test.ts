import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createGitLabPublisher } from "./gitlabPublisher.js";

type MockResponse = {
  status: number;
  body: string;
};

function requestMethod(init?: RequestInit): string {
  return init?.method?.toUpperCase() ?? "GET";
}

function mockFetch(handlers: Array<(url: string, init?: RequestInit) => MockResponse | null>) {
  return (async (url: string, init?: RequestInit) => {
    for (const handler of handlers) {
      const result = handler(url, init);
      if (result !== null) {
        return new Response(result.body, { status: result.status });
      }
    }

    return new Response(`unexpected request: ${requestMethod(init)} ${url}`, { status: 500 });
  }) as typeof fetch;
}

const config = {
  token: "gl-test",
  projectRef: "group/site",
  branch: "main",
  baseUrl: "https://gitlab.com",
};

describe("GitLab publisher", () => {
  it("creates a new file with POST", async () => {
    const publisher = createGitLabPublisher({
      ...config,
      fetch: mockFetch([
        (url, init) => {
          if (url.includes("/repository/files/") && requestMethod(init) === "GET") {
            return { status: 404, body: JSON.stringify({ message: "404 File Not Found" }) };
          }

          if (url.includes("/repository/files/") && requestMethod(init) === "POST") {
            return {
              status: 201,
              body: JSON.stringify({
                file_path: "src/content/blog/new-post.mdx",
                blob_id: "blob-new",
                commit_id: "commit-new",
              }),
            };
          }

          return null;
        },
      ]),
    });

    const result = await publisher.publishFile({
      path: "src/content/blog/new-post.mdx",
      content: "---\ntitle: Hi\n---\n\nBody",
      message: "Add post",
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.created, true);
      assert.equal(result.sha, "blob-new");
      assert.equal(result.commitSha, "commit-new");
    }
  });

  it("updates an existing file with PUT", async () => {
    const publisher = createGitLabPublisher({
      ...config,
      fetch: mockFetch([
        (url, init) => {
          if (url.includes("/repository/files/") && requestMethod(init) === "GET") {
            return {
              status: 200,
              body: JSON.stringify({ blob_id: "blob-old", file_path: "src/content/blog/post.mdx" }),
            };
          }

          if (url.includes("/repository/files/") && requestMethod(init) === "PUT") {
            return {
              status: 200,
              body: JSON.stringify({
                file_path: "src/content/blog/post.mdx",
                blob_id: "blob-updated",
                commit_id: "commit-updated",
              }),
            };
          }

          return null;
        },
      ]),
    });

    const result = await publisher.publishFile({
      path: "src/content/blog/post.mdx",
      content: "updated",
      message: "Update post",
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.created, false);
      assert.equal(result.sha, "blob-updated");
    }
  });

  it("returns actionable error on auth failure", async () => {
    const publisher = createGitLabPublisher({
      ...config,
      fetch: mockFetch([
        () => ({ status: 401, body: JSON.stringify({ message: "401 Unauthorized" }) }),
      ]),
    });

    const result = await publisher.publishFile({
      path: "src/content/blog/post.mdx",
      content: "body",
      message: "Publish",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /GITLAB_TOKEN/);
      assert.equal(result.status, 401);
    }
  });

  it("returns actionable error when project is not found", async () => {
    const publisher = createGitLabPublisher({
      ...config,
      fetch: mockFetch([
        (url, init) => {
          if (requestMethod(init) === "GET") {
            return { status: 404, body: JSON.stringify({ message: "404 File Not Found" }) };
          }

          return { status: 404, body: JSON.stringify({ message: "404 Project Not Found" }) };
        },
      ]),
    });

    const result = await publisher.publishFile({
      path: "src/content/blog/post.mdx",
      content: "body",
      message: "Publish",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /GITLAB_PROJECT/);
    }
  });

  it("returns actionable error when branch is missing", async () => {
    const publisher = createGitLabPublisher({
      ...config,
      fetch: mockFetch([
        (url, init) => {
          if (requestMethod(init) === "GET") {
            return { status: 404, body: JSON.stringify({ message: "404 File Not Found" }) };
          }

          return {
            status: 400,
            body: JSON.stringify({ message: "Branch main not found for project" }),
          };
        },
      ]),
    });

    const result = await publisher.publishFile({
      path: "src/content/blog/post.mdx",
      content: "body",
      message: "Publish",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /GITLAB_BRANCH/);
    }
  });

  it("treats identical content as a successful no-op", async () => {
    const publisher = createGitLabPublisher({
      ...config,
      fetch: mockFetch([
        (url, init) => {
          if (requestMethod(init) === "GET") {
            return {
              status: 200,
              body: JSON.stringify({ blob_id: "blob-old", file_path: "src/content/blog/post.mdx" }),
            };
          }

          return {
            status: 400,
            body: JSON.stringify({ message: "A commit with identical contents already exists" }),
          };
        },
      ]),
    });

    const result = await publisher.publishFile({
      path: "src/content/blog/post.mdx",
      content: "same",
      message: "No-op",
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.sha, "unchanged");
      assert.equal(result.commitSha, "unchanged");
    }
  });
});
