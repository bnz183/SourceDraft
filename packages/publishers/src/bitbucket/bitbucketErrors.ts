export type BitbucketOperation = "publish" | "uploadMedia" | "listPosts" | "readPost";

export type BitbucketErrorContext = {
  workspace?: string;
  repoSlug?: string;
  path?: string;
  branch?: string;
  contentDir?: string;
  mediaDir?: string;
};

type BitbucketErrorBody = {
  error?: { message?: string };
  message?: string;
};

export function bitbucketErrorMessage(body: BitbucketErrorBody | null, fallback: string): string {
  if (body?.error?.message && body.error.message.trim().length > 0) {
    return body.error.message.trim();
  }

  if (body?.message && body.message.trim().length > 0) {
    return body.message.trim();
  }

  return fallback;
}

export function isIdenticalContentError(message: string): boolean {
  return (
    /no changes/i.test(message) ||
    /nothing to commit/i.test(message) ||
    /identical/i.test(message) ||
    /same content/i.test(message)
  );
}

export function isMissingBranchError(message: string): boolean {
  return (
    /branch.*not found/i.test(message) ||
    /unknown branch/i.test(message) ||
    /does not exist.*branch/i.test(message)
  );
}

export function repoLabel(context: BitbucketErrorContext): string {
  if (context.workspace && context.repoSlug) {
    return `${context.workspace}/${context.repoSlug}`;
  }

  return "the configured Bitbucket repository";
}

export function formatBitbucketApiError(
  status: number,
  rawMessage: string,
  operation: BitbucketOperation,
  context: BitbucketErrorContext = {},
): string {
  const message = rawMessage.trim();
  const target = repoLabel(context);
  const branch = context.branch ?? "the configured branch";

  if (status === 401) {
    return "Bitbucket rejected the credentials (401). Check BITBUCKET_TOKEN in .env. If you use an app password, set BITBUCKET_USERNAME as well.";
  }

  if (status === 403) {
    return `Bitbucket denied access to ${target} (403). The token needs repository write permission.`;
  }

  if (status === 404) {
    if (/repository/i.test(message)) {
      return `Bitbucket repository ${target} was not found. Check BITBUCKET_WORKSPACE and BITBUCKET_REPO_SLUG in .env.`;
    }

    if (operation === "uploadMedia") {
      const folder = context.mediaDir ?? context.path ?? "mediaDir";
      return `Could not upload to "${folder}" in ${target}. Check mediaDir in config and that parent folders exist.`;
    }

    return `Bitbucket could not find the requested path in ${target} (404).`;
  }

  if (status === 400 && isMissingBranchError(message)) {
    return `Bitbucket branch "${branch}" was not found in ${target}. Check BITBUCKET_BRANCH in .env.`;
  }

  if (message.length > 0) {
    return `Bitbucket API error (${status}): ${message}`;
  }

  return `Bitbucket API request failed (${status}).`;
}
