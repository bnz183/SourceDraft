const GITHUB_API_VERSION = "2022-11-28";

export type GitHubPublisherConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
};

export type PublishFileInput = {
  path: string;
  content: string;
  message: string;
};

export type PublishFileSuccess = {
  ok: true;
  created: boolean;
  path: string;
  sha: string;
  commitSha: string;
};

export type PublishFileError = {
  ok: false;
  error: string;
  status?: number;
};

export type PublishFileResult = PublishFileSuccess | PublishFileError;

export type GitHubPublisher = {
  publishFile: (input: PublishFileInput) => Promise<PublishFileResult>;
};

type GitHubErrorBody = {
  message?: string;
};

type GitHubContentBody = {
  sha?: string;
};

type GitHubCommitBody = {
  content?: {
    sha?: string;
  };
  commit?: {
    sha?: string;
  };
};

function normalizeRepoPath(path: string): string {
  return path.replace(/^\/+/u, "").trim();
}

function encodeRepoPath(path: string): string {
  return path
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function contentsUrl(config: GitHubPublisherConfig, path: string): string {
  const encodedPath = encodeRepoPath(path);
  return `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${encodedPath}`;
}

function githubHeaders(token: string): Record<string, string> {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
  };
}

async function readGitHubError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as GitHubErrorBody;
    if (typeof body.message === "string" && body.message.length > 0) {
      return body.message;
    }
  } catch {
    // Fall through to status text.
  }

  return response.statusText || "GitHub API request failed.";
}

function encodeContent(content: string): string {
  return Buffer.from(content, "utf8").toString("base64");
}

async function getExistingFileSha(
  config: GitHubPublisherConfig,
  path: string,
): Promise<
  | { found: true; sha: string }
  | { found: false }
  | PublishFileError
> {
  const url = `${contentsUrl(config, path)}?ref=${encodeURIComponent(config.branch)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: githubHeaders(config.token),
  });

  if (response.status === 404) {
    return { found: false };
  }

  if (!response.ok) {
    return {
      ok: false,
      error: await readGitHubError(response),
      status: response.status,
    };
  }

  const body = (await response.json()) as GitHubContentBody;
  if (typeof body.sha !== "string" || body.sha.length === 0) {
    return {
      ok: false,
      error: "GitHub returned a file without a sha.",
      status: response.status,
    };
  }

  return { found: true, sha: body.sha };
}

async function putFile(
  config: GitHubPublisherConfig,
  path: string,
  content: string,
  message: string,
  existingSha?: string,
): Promise<PublishFileResult> {
  const payload: Record<string, string> = {
    message,
    content: encodeContent(content),
    branch: config.branch,
  };

  if (existingSha !== undefined) {
    payload.sha = existingSha;
  }

  const response = await fetch(contentsUrl(config, path), {
    method: "PUT",
    headers: {
      ...githubHeaders(config.token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return {
      ok: false,
      error: await readGitHubError(response),
      status: response.status,
    };
  }

  const body = (await response.json()) as GitHubCommitBody;
  const sha = body.content?.sha;
  const commitSha = body.commit?.sha;

  if (typeof sha !== "string" || sha.length === 0) {
    return {
      ok: false,
      error: "GitHub did not return the published file sha.",
      status: response.status,
    };
  }

  if (typeof commitSha !== "string" || commitSha.length === 0) {
    return {
      ok: false,
      error: "GitHub did not return the commit sha.",
      status: response.status,
    };
  }

  return {
    ok: true,
    created: existingSha === undefined,
    path,
    sha,
    commitSha,
  };
}

export function createGitHubPublisher(
  config: GitHubPublisherConfig,
): GitHubPublisher {
  return {
    async publishFile(input: PublishFileInput): Promise<PublishFileResult> {
      const path = normalizeRepoPath(input.path);
      if (path.length === 0) {
        return {
          ok: false,
          error: "Path is required.",
        };
      }

      if (input.message.trim().length === 0) {
        return {
          ok: false,
          error: "Commit message is required.",
        };
      }

      const existing = await getExistingFileSha(config, path);
      if ("ok" in existing) {
        return existing;
      }

      if (existing.found) {
        return putFile(config, path, input.content, input.message, existing.sha);
      }

      return putFile(config, path, input.content, input.message);
    },
  };
}
