/**
 * GitHub Contents API publisher for SourceDraft v0.1.
 *
 * This MVP uses the Contents API for publish, list, read, and upload flows.
 * It works well for small and medium content folders. Very large directories
 * may hit GitHub listing limits; a future version may add Git Trees API or
 * indexed listing for large sites.
 */
import {
  directoryListingLimitMessage,
  errorContextFromConfig,
  formatGitHubApiError,
  formatLocalGitHubError,
  isDirectoryListingTruncated,
  validateGitHubFileBody,
  type GitHubOperation,
} from "./githubErrors.js";
import { encodeRepoPath, normalizeRepoPath } from "./githubPaths.js";

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
  purpose?: "post" | "media";
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
  contentDir?: string;
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

function apiError(
  response: Response,
  rawMessage: string,
  operation: GitHubOperation,
  config: GitHubPublisherConfig,
  context: { path?: string; contentDir?: string; mediaDir?: string } = {},
): PublishFileError {
  const errorContext = errorContextFromConfig(config, context);
  return {
    ok: false,
    error: formatGitHubApiError(response.status, rawMessage, operation, errorContext),
    status: response.status,
  };
}

function localError(
  message: string,
  operation: GitHubOperation,
  config: GitHubPublisherConfig,
  context: { path?: string; contentDir?: string; mediaDir?: string } = {},
  status?: number,
): PublishFileError {
  return {
    ok: false,
    error: formatLocalGitHubError(message, operation, errorContextFromConfig(config, context)),
    ...(status !== undefined ? { status } : {}),
  };
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
  purpose: "post" | "media",
): Promise<
  | { found: true; sha: string }
  | { found: false }
  | PublishFileError
> {
  const operation: GitHubOperation = purpose === "media" ? "uploadMedia" : "checkFile";
  const url = `${contentsUrl(config, path)}?ref=${encodeURIComponent(config.branch)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: githubHeaders(config.token),
  });

  if (response.status === 404) {
    return { found: false };
  }

  if (!response.ok) {
    const raw = await readGitHubError(response);
    return apiError(response, raw, operation, config, { path });
  }

  let body: GitHubContentBody | GitHubDirectoryEntry[];
  try {
    body = (await response.json()) as GitHubContentBody | GitHubDirectoryEntry[];
  } catch {
    return localError(
      "GitHub returned an unreadable file response.",
      operation,
      config,
      { path },
      response.status,
    );
  }

  if (Array.isArray(body)) {
    return localError("Path is not a file.", operation, config, { path }, response.status);
  }

  const validationError = validateGitHubFileBody(body);
  if (validationError !== null) {
    return localError(validationError, operation, config, { path }, response.status);
  }

  return { found: true, sha: body.sha as string };
}

async function putFile(
  config: GitHubPublisherConfig,
  path: string,
  contentBase64: string,
  message: string,
  purpose: "post" | "media",
  existingSha?: string,
): Promise<PublishFileResult> {
  const operation: GitHubOperation = purpose === "media" ? "uploadMedia" : "publish";
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
    const raw = await readGitHubError(response);
    return apiError(response, raw, operation, config, {
      path,
      ...(purpose === "media" ? { mediaDir: path.split("/").slice(0, -1).join("/") } : {}),
    });
  }

  let body: GitHubCommitBody;
  try {
    body = (await response.json()) as GitHubCommitBody;
  } catch {
    return localError(
      "GitHub returned an unreadable publish response.",
      operation,
      config,
      { path },
      response.status,
    );
  }

  const sha = body.content?.sha;
  const commitSha = body.commit?.sha;

  if (typeof sha !== "string" || sha.length === 0) {
    return localError(
      "GitHub did not return the published file sha.",
      operation,
      config,
      { path },
      response.status,
    );
  }

  if (typeof commitSha !== "string" || commitSha.length === 0) {
    return localError(
      "GitHub did not return the commit sha.",
      operation,
      config,
      { path },
      response.status,
    );
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
  contentDir: string,
  files: ListedFile[],
): Promise<PublishFileError | null> {
  const url = `${contentsUrl(config, path)}?ref=${encodeURIComponent(config.branch)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: githubHeaders(config.token),
  });

  if (!response.ok) {
    const raw = await readGitHubError(response);
    return apiError(response, raw, "listPosts", config, {
      path,
      contentDir,
    });
  }

  let body: GitHubDirectoryEntry | GitHubDirectoryEntry[];
  try {
    body = (await response.json()) as GitHubDirectoryEntry | GitHubDirectoryEntry[];
  } catch {
    return localError(
      "GitHub returned an unreadable directory listing.",
      "listPosts",
      config,
      { path, contentDir },
      response.status,
    );
  }

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
      return null;
    }

    return localError(
      `Could not list posts under "${contentDir}". contentDir should be a folder containing post files.`,
      "listPosts",
      config,
      { path, contentDir },
    );
  }

  if (isDirectoryListingTruncated(body.length)) {
    return localError(directoryListingLimitMessage(), "listPosts", config, {
      path,
      contentDir,
    });
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
      const error = await collectFiles(config, entry.path, contentDir, files);
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
      const purpose = input.purpose ?? "post";

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

      const existing = await getExistingFileSha(config, path, purpose);
      if ("ok" in existing) {
        return existing;
      }

      if (existing.found) {
        return putFile(
          config,
          path,
          encodedContent,
          input.message,
          purpose,
          existing.sha,
        );
      }

      return putFile(config, path, encodedContent, input.message, purpose);
    },

    async listFiles(input: ListFilesInput): Promise<ListFilesResult> {
      const path = normalizeRepoPath(input.path);
      const contentDir = input.contentDir ?? path;

      if (path.length === 0) {
        return {
          ok: false,
          error: "Path is required.",
        };
      }

      const files: ListedFile[] = [];
      const error = await collectFiles(config, path, contentDir, files);
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
        const raw = await readGitHubError(response);
        return apiError(response, raw, "readPost", config, { path });
      }

      let body: GitHubContentBody;
      try {
        body = (await response.json()) as GitHubContentBody;
      } catch {
        return localError(
          "GitHub returned an unreadable file response.",
          "readPost",
          config,
          { path },
          response.status,
        );
      }

      const validationError = validateGitHubFileBody(body);
      if (validationError !== null) {
        return localError(validationError, "readPost", config, { path }, response.status);
      }

      return {
        ok: true,
        path,
        content: Buffer.from(body.content as string, "base64").toString("utf8"),
        sha: body.sha as string,
      };
    },
  };
}
