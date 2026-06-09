import {
  type HttpFetcher,
  parseJsonBody,
  readResponseBody,
  resolveFetcher,
} from "../http.js";
import {
  formatGitLabApiError,
  gitLabErrorMessage,
  isIdenticalContentError,
  type GitLabErrorContext,
  type GitLabOperation,
} from "./gitlabErrors.js";
import {
  encodeGitLabFilePath,
  encodeGitLabProjectRef,
  normalizeRepoPath,
} from "./gitlabPaths.js";

export type GitLabPublisherConfig = {
  token: string;
  projectRef: string;
  branch: string;
  baseUrl: string;
  authorName?: string;
  authorEmail?: string;
  fetch?: HttpFetcher;
};

type GitLabFileBody = {
  file_path?: string;
  blob_id?: string;
  commit_id?: string;
  last_commit_id?: string;
  content?: string;
  encoding?: string;
};

type GitLabCommitBody = {
  file_path?: string;
  blob_id?: string;
  commit_id?: string;
  branch?: string;
};

type GitLabTreeEntry = {
  type?: string;
  path?: string;
  name?: string;
  id?: string;
};

type PublishFileInput = {
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

export type ReadFileSuccess = {
  ok: true;
  path: string;
  content: string;
  sha: string;
};

export type ReadFileResult = ReadFileSuccess | PublishFileError;

export type GitLabPublisher = {
  publishFile: (input: PublishFileInput) => Promise<PublishFileResult>;
  listFiles: (input: { path: string; contentDir?: string }) => Promise<ListFilesResult>;
  readFile: (input: { path: string }) => Promise<ReadFileResult>;
};

function trimBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function authHeaders(token: string): HeadersInit {
  return {
    "PRIVATE-TOKEN": token,
    Accept: "application/json",
  };
}

function errorContext(
  config: GitLabPublisherConfig,
  extras: GitLabErrorContext = {},
): GitLabErrorContext {
  return {
    projectRef: config.projectRef,
    branch: config.branch,
    ...extras,
  };
}

function identicalContentSuccess(path: string, created: boolean): PublishFileSuccess {
  return {
    ok: true,
    created,
    path,
    sha: "unchanged",
    commitSha: "unchanged",
  };
}

export function createGitLabPublisher(config: GitLabPublisherConfig): GitLabPublisher {
  const fetchImpl = resolveFetcher(config.fetch);
  const apiBase = `${trimBaseUrl(config.baseUrl)}/api/v4`;
  const projectSegment = encodeGitLabProjectRef(config.projectRef);

  async function gitLabRequest(
    method: string,
    urlPath: string,
    operation: GitLabOperation,
    context: GitLabErrorContext,
    init?: RequestInit,
  ): Promise<{ ok: true; response: Response; bodyText: string } | PublishFileError> {
    const response = await fetchImpl(`${apiBase}${urlPath}`, {
      ...init,
      method,
      headers: {
        ...authHeaders(config.token),
        ...(init?.headers ?? {}),
      },
    });

    const bodyText = await readResponseBody(response);

    if (!response.ok) {
      const body = parseJsonBody<{ message?: string; error?: string }>(bodyText);
      const rawMessage = gitLabErrorMessage(body, bodyText);
      const formatted = formatGitLabApiError(
        response.status,
        rawMessage,
        operation,
        errorContext(config, context),
      );

      if (operation === "checkFile" && response.status === 404) {
        return { ok: false, error: formatted, status: 404 };
      }

      return {
        ok: false,
        error: formatted,
        status: response.status,
      };
    }

    return { ok: true, response, bodyText };
  }

  async function fileExists(
    filePath: string,
  ): Promise<{ exists: true; blobId: string } | { exists: false } | PublishFileError> {
    const encodedPath = encodeGitLabFilePath(filePath);
    const result = await gitLabRequest(
      "GET",
      `/projects/${projectSegment}/repository/files/${encodedPath}?ref=${encodeURIComponent(config.branch)}`,
      "checkFile",
      { path: filePath },
    );

    if (!result.ok) {
      if (result.status === 404) {
        return { exists: false };
      }

      return result;
    }

    const body = parseJsonBody<GitLabFileBody>(result.bodyText);
    const blobId = body?.blob_id ?? body?.commit_id ?? "";

    if (blobId.length === 0) {
      return {
        ok: false,
        error: "GitLab returned a file response without a blob id.",
      };
    }

    return { exists: true, blobId };
  }

  function commitBody(
    filePath: string,
    content: string,
    encoding: "text" | "base64",
    message: string,
  ): Record<string, string> {
    const body: Record<string, string> = {
      branch: config.branch,
      commit_message: message,
      content,
      encoding,
    };

    if (config.authorName) {
      body.author_name = config.authorName;
    }

    if (config.authorEmail) {
      body.author_email = config.authorEmail;
    }

    return body;
  }

  async function writeFile(
    filePath: string,
    content: string,
    encoding: "text" | "base64",
    message: string,
    created: boolean,
  ): Promise<PublishFileResult> {
    const encodedPath = encodeGitLabFilePath(filePath);
    const method = created ? "POST" : "PUT";
    const operation: GitLabOperation = "publish";
    const body = commitBody(filePath, content, encoding, message);

    const result = await gitLabRequest(
      method,
      `/projects/${projectSegment}/repository/files/${encodedPath}`,
      operation,
      { path: filePath },
      {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    if (!result.ok) {
      if (result.status === 400 && isIdenticalContentError(result.error)) {
        return identicalContentSuccess(filePath, created);
      }

      return result;
    }

    const commitBodyJson = parseJsonBody<GitLabCommitBody>(result.bodyText);
    const sha = commitBodyJson?.blob_id ?? commitBodyJson?.file_path ?? filePath;
    const commitSha = commitBodyJson?.commit_id ?? "unknown";

    return {
      ok: true,
      created,
      path: filePath,
      sha,
      commitSha,
    };
  }

  return {
    async publishFile(input: PublishFileInput): Promise<PublishFileResult> {
      const filePath = normalizeRepoPath(input.path);
      const existsResult = await fileExists(filePath);

      if ("ok" in existsResult && existsResult.ok === false) {
        return existsResult;
      }

      const created = !("exists" in existsResult) || !existsResult.exists;
      const payload =
        "contentBase64" in input && input.contentBase64 !== undefined
          ? { content: input.contentBase64, encoding: "base64" as const }
          : { content: input.content, encoding: "text" as const };

      let result = await writeFile(
        filePath,
        payload.content,
        payload.encoding,
        input.message,
        created,
      );

      if (
        !result.ok &&
        created &&
        result.status === 400 &&
        /already exists/i.test(result.error)
      ) {
        result = await writeFile(
          filePath,
          payload.content,
          payload.encoding,
          input.message,
          false,
        );
      }

      return result;
    },

    async listFiles(input: {
      path: string;
      contentDir?: string;
    }): Promise<ListFilesResult> {
      const folder = normalizeRepoPath(input.path);
      const result = await gitLabRequest(
        "GET",
        `/projects/${projectSegment}/repository/tree?path=${encodeURIComponent(folder)}&ref=${encodeURIComponent(config.branch)}&recursive=true&per_page=100`,
        "listPosts",
        { path: folder, contentDir: input.contentDir ?? folder },
      );

      if (!result.ok) {
        return result;
      }

      const entries = parseJsonBody<GitLabTreeEntry[]>(result.bodyText) ?? [];
      const files = entries
        .filter(
          (entry) =>
            entry.type === "blob" &&
            typeof entry.path === "string" &&
            (entry.path.endsWith(".md") || entry.path.endsWith(".mdx")),
        )
        .map((entry) => ({
          path: entry.path as string,
          name: entry.name ?? entry.path?.split("/").pop() ?? entry.path ?? "",
          sha: entry.id ?? "",
          size: 0,
        }));

      return { ok: true, files };
    },

    async readFile(input: { path: string }): Promise<ReadFileResult> {
      const filePath = normalizeRepoPath(input.path);
      const encodedPath = encodeGitLabFilePath(filePath);
      const result = await gitLabRequest(
        "GET",
        `/projects/${projectSegment}/repository/files/${encodedPath}?ref=${encodeURIComponent(config.branch)}`,
        "readPost",
        { path: filePath },
      );

      if (!result.ok) {
        return result;
      }

      const body = parseJsonBody<GitLabFileBody>(result.bodyText);

      if (!body?.content) {
        return {
          ok: false,
          error: "GitLab did not return file content.",
        };
      }

      const encoding = body.encoding ?? "base64";
      const content =
        encoding === "base64"
          ? Buffer.from(body.content, "base64").toString("utf8")
          : body.content;

      return {
        ok: true,
        path: filePath,
        content,
        sha: body.blob_id ?? body.commit_id ?? "",
      };
    },
  };
}
