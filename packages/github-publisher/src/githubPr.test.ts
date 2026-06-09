import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  commitFileToBranch,
  createPullRequest,
  ensureBranchRef,
  findOpenPullRequest,
  publishFileViaPullRequest,
  readBranchRefSha,
} from "./githubPr.js";

type MockResponse = {
  status: number;
  body: string;
};

const config = {
  token: "gh-test",
  owner: "acme",
  repo: "blog",
  baseBranch: "main",
};

const originalFetch = globalThis.fetch;

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

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("github PR helpers", () => {
  it("reads base branch ref sha", async () => {
    globalThis.fetch = mockFetch([
      (url) => {
        if (url.includes("/git/ref/heads%2Fmain") || url.endsWith("/git/ref/heads/main")) {
          return {
            status: 200,
            body: JSON.stringify({ object: { sha: "base-sha" } }),
          };
        }

        return null;
      },
    ]);

    const result = await readBranchRefSha(config, "main");
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.sha, "base-sha");
    }
  });

  it("creates a branch when it does not exist", async () => {
    globalThis.fetch = mockFetch([
      (url, init) => {
        if (
          (url.includes("/git/ref/heads%2Fsourcedraft%2Fnew-post") ||
            url.endsWith("/git/ref/heads/sourcedraft/new-post")) &&
          requestMethod(init) === "GET"
        ) {
          return { status: 404, body: JSON.stringify({ message: "Not Found" }) };
        }

        if (url.endsWith("/git/refs") && requestMethod(init) === "POST") {
          return { status: 201, body: JSON.stringify({ ref: "refs/heads/sourcedraft/new-post" }) };
        }

        return null;
      },
    ]);

    const result = await ensureBranchRef(config, "sourcedraft/new-post", "base-sha");
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.created, true);
    }
  });

  it("reuses an existing branch", async () => {
    globalThis.fetch = mockFetch([
      (url) => {
        if (
          url.includes("/git/ref/heads%2Fsourcedraft%2Fnew-post") ||
          url.endsWith("/git/ref/heads/sourcedraft/new-post")
        ) {
          return {
            status: 200,
            body: JSON.stringify({ object: { sha: "branch-sha" } }),
          };
        }

        return null;
      },
    ]);

    const result = await ensureBranchRef(config, "sourcedraft/new-post", "base-sha");
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.created, false);
    }
  });

  it("commits a file to a PR branch", async () => {
    globalThis.fetch = mockFetch([
      (url, init) => {
        if (url.includes("/contents/src/content/blog/new-post.mdx") && requestMethod(init) === "PUT") {
          const body = JSON.parse(String(init?.body)) as { branch?: string };
          assert.equal(body.branch, "sourcedraft/new-post");
          return {
            status: 200,
            body: JSON.stringify({
              content: { sha: "file-sha" },
              commit: { sha: "commit-sha" },
            }),
          };
        }

        return null;
      },
    ]);

    const result = await commitFileToBranch(
      config,
      "src/content/blog/new-post.mdx",
      "sourcedraft/new-post",
      Buffer.from("hello").toString("base64"),
      "Publish: new-post",
    );

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.created, true);
      assert.equal(result.sha, "file-sha");
      assert.equal(result.commitSha, "commit-sha");
    }
  });

  it("finds an existing open pull request", async () => {
    globalThis.fetch = mockFetch([
      (url) => {
        if (url.includes("/pulls?")) {
          return {
            status: 200,
            body: JSON.stringify([
              {
                number: 42,
                html_url: "https://github.com/acme/blog/pull/42",
              },
            ]),
          };
        }

        return null;
      },
    ]);

    const result = await findOpenPullRequest(config, "sourcedraft/new-post");
    assert.equal(result.ok, true);
    if (result.ok && result.pr !== null) {
      assert.equal(result.pr.number, 42);
    }
  });

  it("creates a draft pull request", async () => {
    globalThis.fetch = mockFetch([
      (url, init) => {
        if (url.endsWith("/pulls") && requestMethod(init) === "POST") {
          const body = JSON.parse(String(init?.body)) as { draft?: boolean };
          assert.equal(body.draft, true);
          return {
            status: 201,
            body: JSON.stringify({
              number: 7,
              html_url: "https://github.com/acme/blog/pull/7",
              draft: true,
            }),
          };
        }

        return null;
      },
    ]);

    const result = await createPullRequest(
      config,
      "sourcedraft/new-post",
      "Publish: new-post",
      true,
    );

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.pr.number, 7);
      assert.equal(result.pr.draft, true);
    }
  });

  it("rejects draft PR creation when GitHub does not mark it draft", async () => {
    globalThis.fetch = mockFetch([
      (url, init) => {
        if (url.endsWith("/pulls") && requestMethod(init) === "POST") {
          return {
            status: 201,
            body: JSON.stringify({
              number: 8,
              html_url: "https://github.com/acme/blog/pull/8",
              draft: false,
            }),
          };
        }

        return null;
      },
    ]);

    const result = await createPullRequest(
      config,
      "sourcedraft/new-post",
      "Publish: new-post",
      true,
    );

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.match(result.error, /draft pull requests are not available/i);
    }
  });

  it("publishes via pull request end to end", async () => {
    globalThis.fetch = mockFetch([
      (url, init) => {
        if (
          (url.includes("/git/ref/heads%2Fmain") || url.endsWith("/git/ref/heads/main")) &&
          requestMethod(init) === "GET"
        ) {
          return {
            status: 200,
            body: JSON.stringify({ object: { sha: "base-sha" } }),
          };
        }

        if (
          (url.includes("/git/ref/heads%2Fsourcedraft%2Fnew-post") ||
            url.endsWith("/git/ref/heads/sourcedraft/new-post")) &&
          requestMethod(init) === "GET"
        ) {
          return { status: 404, body: JSON.stringify({ message: "Not Found" }) };
        }

        if (url.endsWith("/git/refs") && requestMethod(init) === "POST") {
          return { status: 201, body: JSON.stringify({ ref: "refs/heads/sourcedraft/new-post" }) };
        }

        if (
          url.includes("/contents/src/content/blog/new-post.mdx") &&
          requestMethod(init) === "GET"
        ) {
          return { status: 404, body: JSON.stringify({ message: "Not Found" }) };
        }

        if (
          url.includes("/contents/src/content/blog/new-post.mdx") &&
          requestMethod(init) === "PUT"
        ) {
          return {
            status: 200,
            body: JSON.stringify({
              content: { sha: "file-sha" },
              commit: { sha: "commit-sha" },
            }),
          };
        }

        if (url.includes("/pulls?")) {
          return { status: 200, body: JSON.stringify([]) };
        }

        if (url.endsWith("/pulls") && requestMethod(init) === "POST") {
          return {
            status: 201,
            body: JSON.stringify({
              number: 99,
              html_url: "https://github.com/acme/blog/pull/99",
              draft: false,
            }),
          };
        }

        return null;
      },
    ]);

    const result = await publishFileViaPullRequest(config, {
      path: "src/content/blog/new-post.mdx",
      content: "---\ntitle: Hi\n---\n\nBody",
      message: "Publish: new-post",
      slug: "new-post",
      draft: false,
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.created, true);
      assert.equal(result.prNumber, 99);
      assert.equal(result.prBranch, "sourcedraft/new-post");
      assert.equal(result.baseBranch, "main");
      assert.equal(result.prUrl, "https://github.com/acme/blog/pull/99");
    }
  });
});
