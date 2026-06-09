const GITHUB_API_VERSION = "2022-11-28";

export type GitHubPublisherConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
};

export type PublishFileInput = {
  path: string;
  message: string;
} & (
  | { content: string; contentBase64?: never }
  | { contentBase64: string; content?: never }
);

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

export type ListFilesInput = {
  path: string;
};

export type ListedFile = {
  path: string;
  name: string;
  sha: string;
  size: number;
};

export type ListFilesSuccess = {
  ok: true;
  files: ListedFile[];
};

export type ListFilesResult = ListFilesSuccess | PublishFileError;

export type ReadFileInput = {
  path: string;
};

export type ReadFileSuccess = {
  ok: true;
  path: string;
  content: string;
  sha: string;
};

export type ReadFileResult = ReadFileSuccess | PublishFileError;

export type GitHubPublisher = {
  publishFile: (input: PublishFileInput) => Promise<PublishFileResult>;
  listFiles: (input: ListFilesInput) => Promise<ListFilesResult>;
  readFile: (input: ReadFileInput) => Promise<ReadFileResult>;
};

type GitHubErrorBody = {
  message?: string;
};

type GitHubContentBody = {
  sha?: string;
  type?: string;
  content?: string;
  encoding?: string;
  path?: string;
  name?: string;
  size?: number;
};

type GitHubDirectoryEntry = {
  type?: string;
  path?: string;
  name?: string;
  sha?: string;
  size?: number;
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

function resolvePublishContent(input: PublishFileInput): PublishFileError | string {
  const hasContent = typeof input.content === "string";
  const hasBase64 = typeof input.contentBase64 === "string";

  if (hasContent === hasBase64) {
    return {
      ok: false,
      error: "Provide exactly one of content or contentBase64.",
    };
  }

  if (hasBase64) {
    const encoded = input.contentBase64.trim();
    if (encoded.length === 0) {
      return { ok: false, error: "contentBase64 is required." };
    }

    try {
      Buffer.from(encoded, "base64");
    } catch {
      return { ok: false, error: "contentBase64 is not valid base64." };
    }

    return encoded;
  }

  return encodeContent(input.content);
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
  contentBase64: string,
  message: string,
  existingSha?: string,
): Promise<PublishFileResult> {
  const payload: Record<string, string> = {
    message,
    content: contentBase64,
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

async function collectFiles(
  config: GitHubPublisherConfig,
  path: string,
  files: ListedFile[],
): Promise<PublishFileError | null> {
  const url = `${contentsUrl(config, path)}?ref=${encodeURIComponent(config.branch)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: githubHeaders(config.token),
  });

  if (!response.ok) {
    return {
      ok: false,
      error: await readGitHubError(response),
      status: response.status,
    };
  }

  const body = (await response.json()) as GitHubDirectoryEntry | GitHubDirectoryEntry[];

  if (!Array.isArray(body)) {
    if (
      body.type === "file" &&
      typeof body.path === "string" &&
      typeof body.name === "string" &&
      typeof body.sha === "string" &&
      typeof body.size === "number"
    ) {
      files.push({
        path: body.path,
        name: body.name,
        sha: body.sha,
        size: body.size,
      });
    }

    return null;
  }

  for (const entry of body) {
    if (entry.type === "file") {
      if (
        typeof entry.path !== "string" ||
        typeof entry.name !== "string" ||
        typeof entry.sha !== "string" ||
        typeof entry.size !== "number"
      ) {
        continue;
      }

      files.push({
        path: entry.path,
        name: entry.name,
        sha: entry.sha,
        size: entry.size,
      });
      continue;
    }

    if (entry.type === "dir" && typeof entry.path === "string") {
      const error = await collectFiles(config, entry.path, files);
      if (error !== null) {
        return error;
      }
    }
  }

  return null;
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

      const encodedContent = resolvePublishContent(input);
      if (typeof encodedContent !== "string") {
        return encodedContent;
      }

      const existing = await getExistingFileSha(config, path);
      if ("ok" in existing) {
        return existing;
      }

      if (existing.found) {
        return putFile(
          config,
          path,
          encodedContent,
          input.message,
          existing.sha,
        );
      }

      return putFile(config, path, encodedContent, input.message);
    },

    async listFiles(input: ListFilesInput): Promise<ListFilesResult> {
      const path = normalizeRepoPath(input.path);
      if (path.length === 0) {
        return {
          ok: false,
          error: "Path is required.",
        };
      }

      const files: ListedFile[] = [];
      const error = await collectFiles(config, path, files);
      if (error !== null) {
        return error;
      }

      return { ok: true, files };
    },

    async readFile(input: ReadFileInput): Promise<ReadFileResult> {
      const path = normalizeRepoPath(input.path);
      if (path.length === 0) {
        return {
          ok: false,
          error: "Path is required.",
        };
      }

      const url = `${contentsUrl(config, path)}?ref=${encodeURIComponent(config.branch)}`;
      const response = await fetch(url, {
        method: "GET",
        headers: githubHeaders(config.token),
      });

      if (!response.ok) {
        return {
          ok: false,
          error: await readGitHubError(response),
          status: response.status,
        };
      }

      const body = (await response.json()) as GitHubContentBody;
      if (body.type !== "file") {
        return {
          ok: false,
          error: "Path is not a file.",
        };
      }

      if (typeof body.content !== "string" || body.encoding !== "base64") {
        return {
          ok: false,
          error: "GitHub did not return base64 file content.",
        };
      }

      if (typeof body.sha !== "string" || body.sha.length === 0) {
        return {
          ok: false,
          error: "GitHub returned a file without a sha.",
        };
      }

      return {
        ok: true,
        path,
        content: Buffer.from(body.content, "base64").toString("utf8"),
        sha: body.sha,
      };
    },
  };
}
