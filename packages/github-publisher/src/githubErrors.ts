/** GitHub Contents API returns at most 1000 entries per directory listing. */
export const GITHUB_DIRECTORY_LISTING_LIMIT = 1000;

/** GitHub Contents API returns inline base64 content for files up to ~1 MB. */
export const GITHUB_INLINE_FILE_SIZE_LIMIT = 1_000_000;

export type GitHubOperation =
  | "publish"
  | "uploadMedia"
  | "listPosts"
  | "readPost"
  | "checkFile";

export type GitHubErrorContext = {
  owner?: string;
  repo?: string;
  path?: string;
  contentDir?: string;
  mediaDir?: string;
};

type GitHubContentBody = {
  type?: string;
  content?: string;
  encoding?: string;
  sha?: string;
  size?: number;
};

export function isDirectoryListingTruncated(entryCount: number): boolean {
  return entryCount >= GITHUB_DIRECTORY_LISTING_LIMIT;
}

export function repoLabel(context: GitHubErrorContext): string {
  if (context.owner && context.repo) {
    return `${context.owner}/${context.repo}`;
  }

  return "the configured repository";
}

const BRANCH_PROTECTION_HINT =
  " Direct publish to a protected branch failed. Try pull-request or draft-pull-request publish mode (SOURCEDRAFT_PUBLISH_MODE).";

export function isBranchProtectionError(status: number, rawMessage: string): boolean {
  if (status !== 403 && status !== 422) {
    return false;
  }

  const lowerMessage = rawMessage.toLowerCase();
  return (
    lowerMessage.includes("protected") ||
    lowerMessage.includes("ruleset") ||
    lowerMessage.includes("required status") ||
    lowerMessage.includes("unsigned") ||
    lowerMessage.includes("commit must be signed") ||
    lowerMessage.includes("must be made through a pull request")
  );
}

export function branchProtectionRecommendation(
  status: number,
  rawMessage: string,
): string | null {
  if (!isBranchProtectionError(status, rawMessage)) {
    return null;
  }

  return BRANCH_PROTECTION_HINT;
}

export function formatGitHubApiError(
  status: number,
  rawMessage: string,
  operation: GitHubOperation,
  context: GitHubErrorContext = {},
): string {
  const message = rawMessage.trim();
  const target = repoLabel(context);
  const protectionHint =
    operation === "publish" ? branchProtectionRecommendation(status, message) : null;

  if (status === 401) {
    return "GitHub rejected the token (401). Check GITHUB_TOKEN in .env — it may be missing, expired, or revoked.";
  }

  if (status === 403) {
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes("rate limit")) {
      return "GitHub API rate limit reached. Wait a few minutes and try again.";
    }

    const base = `GitHub denied access to ${target} (403). The token needs read and write permission for repository contents on this repo and branch.`;
    return protectionHint ? `${base}${protectionHint}` : base;
  }

  if (status === 404) {
    const lowerMessage = message.toLowerCase();
    if (
      lowerMessage.includes("repository") &&
      lowerMessage.includes("not found")
    ) {
      return `Repository ${target} was not found. Check GITHUB_OWNER and GITHUB_REPO in .env.`;
    }

    if (operation === "listPosts") {
      const folder = context.contentDir ?? context.path ?? "contentDir";
      return `Could not find the posts folder "${folder}" in ${target}. Check contentDir in sourcedraft.config.json and that the folder exists on the configured branch.`;
    }

    if (operation === "uploadMedia") {
      const folder = context.mediaDir ?? context.path ?? "mediaDir";
      return `Could not find the media folder "${folder}" in ${target}. Check mediaDir in config. Parent folders must already exist in the repo.`;
    }

    if (operation === "readPost") {
      const postPath = context.path ?? "the requested path";
      return `Could not open post "${postPath}". It may have been moved, renamed, or deleted on GitHub.`;
    }

    if (operation === "publish" || operation === "checkFile") {
      const filePath = context.path ?? "the target path";
      return `GitHub could not find "${filePath}" in ${target} (404). Check contentDir and the post path.`;
    }

    return `GitHub could not find the requested path in ${target} (404).`;
  }

  if (status === 422) {
    const base = `GitHub rejected the request (422). ${message || "Check the file path and branch."}`;
    return protectionHint ? `${base}${protectionHint}` : base;
  }

  if (message.length > 0) {
    return `GitHub API error (${status}): ${message}`;
  }

  return `GitHub API request failed (${status}).`;
}

export function formatLocalGitHubError(
  message: string,
  operation: GitHubOperation,
  context: GitHubErrorContext = {},
): string {
  if (message === "Path is not a file.") {
    const postPath = context.path ?? "That path";
    return `${postPath} is a folder, not a post file.`;
  }

  if (message === "GitHub returned a file without a sha.") {
    return "GitHub returned an unexpected file response (missing sha). Try again or check the repository state.";
  }

  if (message === "GitHub did not return the published file sha.") {
    return "Publish appeared to succeed but GitHub did not return the new file sha. Check the repository on GitHub.";
  }

  if (message === "GitHub did not return the commit sha.") {
    return "Publish appeared to succeed but GitHub did not return a commit sha. Check the repository on GitHub.";
  }

  if (message === "GitHub did not return base64 file content.") {
    return "GitHub did not return readable file content. The file may be too large for the Contents API in v0.1.";
  }

  if (message.startsWith("GitHub directory listing limit reached")) {
    return message;
  }

  return message;
}

export function validateGitHubFileBody(body: GitHubContentBody): string | null {
  if (body.type !== "file") {
    if (body.type === "dir") {
      return "Path is not a file.";
    }

    return "Path is not a file.";
  }

  if (typeof body.sha !== "string" || body.sha.length === 0) {
    return "GitHub returned a file without a sha.";
  }

  const size = typeof body.size === "number" ? body.size : 0;
  if (body.content === undefined && size > GITHUB_INLINE_FILE_SIZE_LIMIT) {
    return "File is too large for the GitHub Contents API (over 1 MB). SourceDraft v0.1 cannot read or publish this file inline.";
  }

  if (typeof body.content !== "string" || body.encoding !== "base64") {
    return "GitHub did not return base64 file content.";
  }

  return null;
}

export function directoryListingLimitMessage(): string {
  return (
    "GitHub directory listing limit reached (1000 entries in one folder). " +
    "SourceDraft v0.1 uses the Contents API, which is suitable for small and medium content folders. " +
    "Very large sites may need a future Git Trees API or indexed listing implementation."
  );
}

export function errorContextFromConfig(
  config: { owner: string; repo: string },
  extras: GitHubErrorContext = {},
): GitHubErrorContext {
  return {
    owner: config.owner,
    repo: config.repo,
    ...extras,
  };
}
