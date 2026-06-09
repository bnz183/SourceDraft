export type GitLabOperation =
  | "publish"
  | "uploadMedia"
  | "listPosts"
  | "readPost"
  | "checkFile";

export type GitLabErrorContext = {
  projectRef?: string;
  path?: string;
  branch?: string;
  contentDir?: string;
  mediaDir?: string;
};

type GitLabErrorBody = {
  message?: string;
  error?: string;
};

export function gitLabErrorMessage(body: GitLabErrorBody | null, fallback: string): string {
  if (body?.message && body.message.trim().length > 0) {
    return body.message.trim();
  }

  if (body?.error && body.error.trim().length > 0) {
    return body.error.trim();
  }

  return fallback;
}

export function isIdenticalContentError(message: string): boolean {
  return (
    /identical/i.test(message) ||
    /nothing to commit/i.test(message) ||
    /no changes/i.test(message) ||
    /same content/i.test(message) ||
    /already exists.*branch/i.test(message)
  );
}

export function isMissingBranchError(message: string): boolean {
  return (
    /branch.*not found/i.test(message) ||
    /invalid branch/i.test(message) ||
    /unknown revision/i.test(message) ||
    /does not exist.*branch/i.test(message)
  );
}

export function projectLabel(context: GitLabErrorContext): string {
  return context.projectRef ?? "the configured GitLab project";
}

export function formatGitLabApiError(
  status: number,
  rawMessage: string,
  operation: GitLabOperation,
  context: GitLabErrorContext = {},
): string {
  const message = rawMessage.trim();
  const target = projectLabel(context);
  const branch = context.branch ?? "the configured branch";

  if (status === 401) {
    return "GitLab rejected the token (401). Check GITLAB_TOKEN in .env — it may be missing, expired, or revoked.";
  }

  if (status === 403) {
    return `GitLab denied access to ${target} (403). The token needs maintainer/developer access with repository file write permission.`;
  }

  if (status === 404) {
    if (operation === "checkFile") {
      return "";
    }

    if (/project.*not found/i.test(message) || /could not be found/i.test(message)) {
      return `GitLab project ${target} was not found. Check GITLAB_PROJECT_ID or GITLAB_PROJECT_PATH in .env.`;
    }

    if (operation === "listPosts") {
      const folder = context.contentDir ?? context.path ?? "contentDir";
      return `Could not find the posts folder "${folder}" in ${target} on branch ${branch}. Check contentDir and GITLAB_BRANCH.`;
    }

    if (operation === "uploadMedia") {
      const folder = context.mediaDir ?? context.path ?? "mediaDir";
      return `Could not find the media folder "${folder}" in ${target}. Check mediaDir in config. Parent folders must already exist in the repo.`;
    }

    if (operation === "readPost") {
      const postPath = context.path ?? "the requested path";
      return `Could not open post "${postPath}". It may have been moved, renamed, or deleted in GitLab.`;
    }

    if (operation === "publish") {
      const filePath = context.path ?? "the target path";
      return `GitLab could not find "${filePath}" in ${target} (404). Check contentDir and the post path.`;
    }

    return `GitLab could not find the requested resource in ${target} (404).`;
  }

  if (status === 400 && isMissingBranchError(message)) {
    return `GitLab branch "${branch}" was not found in ${target}. Check GITLAB_BRANCH in .env.`;
  }

  if (message.length > 0) {
    return `GitLab API error (${status}): ${message}`;
  }

  return `GitLab API request failed (${status}).`;
}
