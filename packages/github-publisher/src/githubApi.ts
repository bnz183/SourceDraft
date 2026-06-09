import {
  errorContextFromConfig,
  formatGitHubApiError,
  formatLocalGitHubError,
  type GitHubOperation,
} from "./githubErrors.js";
import { encodeRepoPath } from "./githubPaths.js";

export const GITHUB_API_VERSION = "2022-11-28";

export type GitHubApiConfig = {
  token: string;
  owner: string;
  repo: string;
};

type GitHubErrorBody = {
  message?: string;
};

export type GitHubApiError = {
  ok: false;
  error: string;
  status?: number;
};

export function repoApiBase(config: GitHubApiConfig): string {
  return `https://api.github.com/repos/${config.owner}/${config.repo}`;
}

export function contentsUrl(config: GitHubApiConfig, path: string): string {
  return `${repoApiBase(config)}/contents/${encodeRepoPath(path)}`;
}

export function githubHeaders(token: string): Record<string, string> {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": GITHUB_API_VERSION,
  };
}

export async function readGitHubError(response: Response): Promise<string> {
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

export function apiError(
  response: Response,
  rawMessage: string,
  operation: GitHubOperation,
  config: GitHubApiConfig,
  context: { path?: string; contentDir?: string; mediaDir?: string } = {},
): GitHubApiError {
  return {
    ok: false,
    error: formatGitHubApiError(
      response.status,
      rawMessage,
      operation,
      errorContextFromConfig(config, context),
    ),
    status: response.status,
  };
}

export function localError(
  message: string,
  operation: GitHubOperation,
  config: GitHubApiConfig,
  context: { path?: string; contentDir?: string; mediaDir?: string } = {},
  status?: number,
): GitHubApiError {
  return {
    ok: false,
    error: formatLocalGitHubError(
      message,
      operation,
      errorContextFromConfig(config, context),
    ),
    ...(status !== undefined ? { status } : {}),
  };
}
