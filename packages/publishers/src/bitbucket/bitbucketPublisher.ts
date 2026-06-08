/**
 * Bitbucket Cloud publisher using the commit-upload src API.
 *
 * Unlike GitHub/GitLab file APIs, Bitbucket create/update is always a commit
 * upload to POST /2.0/repositories/{workspace}/{repo_slug}/src — not a
 * per-file Contents API with separate create/update endpoints.
 */
import {
  type HttpFetcher,
  parseJsonBody,
  readResponseBody,
  resolveFetcher,
} from "../http.js";
import {
  bitbucketErrorMessage,
  formatBitbucketApiError,
  isIdenticalContentError,
  type BitbucketErrorContext,
  type BitbucketOperation,
} from "./bitbucketErrors.js";
import { normalizeRepoPath } from "./bitbucketPaths.js";

const BITBUCKET_API_BASE = "https://api.bitbucket.org/2.0";

export type BitbucketPublisherConfig = {
  token: string;
  workspace: string;
  repoSlug: string;
  branch: string;
  username?: string;
  fetch?: HttpFetcher;
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

export type BitbucketPublisher = {
  publishFile: (input: PublishFileInput) => Promise<PublishFileResult>;
};

function authHeaders(config: BitbucketPublisherConfig): HeadersInit {
  if (config.username) {
    const credentials = Buffer.from(`${config.username}:${config.token}`).toString("base64");
    return {
      Authorization: `Basic ${credentials}`,
      Accept: "application/json",
    };
  }

  return {
    Authorization: `Bearer ${config.token}`,
    Accept: "application/json",
  };
}

function errorContext(
  config: BitbucketPublisherConfig,
  extras: BitbucketErrorContext = {},
): BitbucketErrorContext {
  return {
    workspace: config.workspace,
    repoSlug: config.repoSlug,
    branch: config.branch,
    ...extras,
  };
}

function identicalContentSuccess(path: string): PublishFileSuccess {
  return {
    ok: true,
    created: false,
    path,
    sha: "unchanged",
    commitSha: "unchanged",
  };
}

type CommitResponse = {
  hash?: string;
};

export function createBitbucketPublisher(config: BitbucketPublisherConfig): BitbucketPublisher {
  const fetchImpl = resolveFetcher(config.fetch);
  const repoPath = `${config.workspace}/${config.repoSlug}`;

  async function commitUpload(
    filePath: string,
    body: BodyInit,
    headers: HeadersInit,
    operation: BitbucketOperation,
  ): Promise<PublishFileResult> {
    const response = await fetchImpl(
      `${BITBUCKET_API_BASE}/repositories/${repoPath}/src`,
      {
        method: "POST",
        headers: {
          ...authHeaders(config),
          ...headers,
        },
        body,
      },
    );

    const bodyText = await readResponseBody(response);

    if (!response.ok) {
      const parsed = parseJsonBody<{ error?: { message?: string }; message?: string }>(bodyText);
      const rawMessage = bitbucketErrorMessage(parsed, bodyText);

      if (response.status === 400 && isIdenticalContentError(rawMessage)) {
        return identicalContentSuccess(filePath);
      }

      return {
        ok: false,
        error: formatBitbucketApiError(
          response.status,
          rawMessage,
          operation,
          errorContext(config, { path: filePath }),
        ),
        status: response.status,
      };
    }

    const commit = parseJsonBody<CommitResponse>(bodyText);
    const commitSha = commit?.hash ?? "unknown";

    return {
      ok: true,
      created: true,
      path: filePath,
      sha: commitSha,
      commitSha,
    };
  }

  return {
    async publishFile(input: PublishFileInput): Promise<PublishFileResult> {
      const filePath = normalizeRepoPath(input.path);
      const params = new URLSearchParams();
      params.set("message", input.message);
      params.set("branch", config.branch);
      params.set(filePath, input.content ?? "");

      if ("contentBase64" in input && input.contentBase64 !== undefined) {
        const form = new FormData();
        form.set("message", input.message);
        form.set("branch", config.branch);
        const bytes = Buffer.from(input.contentBase64, "base64");
        const blob = new Blob([bytes]);
        form.set(filePath, blob, filePath.split("/").pop() ?? "upload.bin");

        return commitUpload(filePath, form, {}, "uploadMedia");
      }

      return commitUpload(
        filePath,
        params.toString(),
        { "Content-Type": "application/x-www-form-urlencoded" },
        "publish",
      );
    },
  };
}
