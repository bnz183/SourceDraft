import { trimTrailingSlashes } from "@sourcedraft/core";
import { createGhostAdminJwt } from "@sourcedraft/publishers";

export type ConnectionCheckResult = {
  ok: boolean;
  detail: string;
};

function isValidDeployHookUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export async function checkGitHubConnection(
  env: Record<string, string | undefined>,
): Promise<ConnectionCheckResult> {
  const token = env.GITHUB_TOKEN?.trim();
  const owner = env.GITHUB_OWNER?.trim();
  const repo = env.GITHUB_REPO?.trim();

  if (!token || !owner || !repo) {
    return { ok: false, detail: "Missing GitHub credentials for connection check." };
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "SourceDraft-Setup",
    },
  });

  if (response.ok) {
    return { ok: true, detail: `Repository ${owner}/${repo} is reachable.` };
  }

  if (response.status === 404) {
    return { ok: false, detail: "Repository not found or token lacks access." };
  }

  return { ok: false, detail: `GitHub API returned ${response.status}.` };
}

export async function checkGitLabConnection(
  env: Record<string, string | undefined>,
): Promise<ConnectionCheckResult> {
  const token = env.GITLAB_TOKEN?.trim();
  const projectId = env.GITLAB_PROJECT_ID?.trim();
  const projectPath = env.GITLAB_PROJECT_PATH?.trim();
  const baseUrl = trimTrailingSlashes(env.GITLAB_BASE_URL?.trim() || "https://gitlab.com");

  if (!token) {
    return { ok: false, detail: "Missing GitLab token for connection check." };
  }

  const projectRef = projectId
    ? encodeURIComponent(projectId)
    : projectPath
      ? encodeURIComponent(projectPath)
      : null;

  if (!projectRef) {
    return { ok: false, detail: "Set GITLAB_PROJECT_ID or GITLAB_PROJECT_PATH." };
  }

  const response = await fetch(`${baseUrl}/api/v4/projects/${projectRef}`, {
    headers: {
      "PRIVATE-TOKEN": token,
      "User-Agent": "SourceDraft-Setup",
    },
  });

  if (response.ok) {
    return { ok: true, detail: "GitLab project is reachable." };
  }

  return { ok: false, detail: `GitLab API returned ${response.status}.` };
}

export async function checkBitbucketConnection(
  env: Record<string, string | undefined>,
): Promise<ConnectionCheckResult> {
  const token = env.BITBUCKET_TOKEN?.trim();
  const workspace = env.BITBUCKET_WORKSPACE?.trim();
  const repoSlug = env.BITBUCKET_REPO_SLUG?.trim();

  if (!token || !workspace || !repoSlug) {
    return { ok: false, detail: "Missing Bitbucket credentials for connection check." };
  }

  const response = await fetch(
    `https://api.bitbucket.org/2.0/repositories/${workspace}/${repoSlug}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "User-Agent": "SourceDraft-Setup",
      },
    },
  );

  if (response.ok) {
    return { ok: true, detail: `Repository ${workspace}/${repoSlug} is reachable.` };
  }

  return { ok: false, detail: `Bitbucket API returned ${response.status}.` };
}

export async function checkWordPressConnection(
  env: Record<string, string | undefined>,
): Promise<ConnectionCheckResult> {
  const apiUrl = trimTrailingSlashes(env.WORDPRESS_API_URL?.trim() ?? "");
  const username = env.WORDPRESS_USERNAME?.trim();
  const appPassword = env.WORDPRESS_APP_PASSWORD?.trim();

  if (!apiUrl || !username || !appPassword) {
    return { ok: false, detail: "Missing WordPress credentials for connection check." };
  }

  const auth = Buffer.from(`${username}:${appPassword}`).toString("base64");
  const response = await fetch(`${apiUrl}/wp-json/wp/v2/users/me`, {
    headers: {
      Authorization: `Basic ${auth}`,
      Accept: "application/json",
      "User-Agent": "SourceDraft-Setup",
    },
  });

  if (response.ok) {
    return { ok: true, detail: "WordPress REST API authenticated successfully." };
  }

  return { ok: false, detail: `WordPress API returned ${response.status}.` };
}

export async function checkGhostConnection(
  env: Record<string, string | undefined>,
): Promise<ConnectionCheckResult> {
  const adminUrl = trimTrailingSlashes(env.GHOST_ADMIN_URL?.trim() ?? "");
  const apiKey = env.GHOST_ADMIN_API_KEY?.trim();

  if (!adminUrl || !apiKey) {
    return { ok: false, detail: "Missing Ghost credentials for connection check." };
  }

  const jwt = createGhostAdminJwt(apiKey);
  if ("ok" in jwt) {
    return { ok: false, detail: jwt.error };
  }

  const version = env.GHOST_ACCEPT_VERSION?.trim() || "v5.126";

  const response = await fetch(`${adminUrl}/ghost/api/admin/site/`, {
    headers: {
      Authorization: `Ghost ${jwt.token}`,
      Accept: "application/json",
      "Accept-Version": version,
      "User-Agent": "SourceDraft-Setup",
    },
  });

  if (response.ok) {
    return { ok: true, detail: "Ghost Admin API authenticated successfully." };
  }

  return { ok: false, detail: `Ghost API returned ${response.status}.` };
}

export function checkDeployHookUrlShape(
  env: Record<string, string | undefined>,
): ConnectionCheckResult {
  const url = env.DEPLOY_HOOK_URL?.trim();
  if (!url) {
    return { ok: false, detail: "DEPLOY_HOOK_URL is not set." };
  }

  if (!isValidDeployHookUrl(url)) {
    return { ok: false, detail: "DEPLOY_HOOK_URL must be a valid http(s) URL." };
  }

  return { ok: true, detail: "Deploy hook URL shape looks valid (not triggered)." };
}

export async function checkPublisherConnection(
  publisher: string,
  env: Record<string, string | undefined>,
): Promise<ConnectionCheckResult | null> {
  switch (publisher) {
    case "github":
      return checkGitHubConnection(env);
    case "gitlab":
      return checkGitLabConnection(env);
    case "bitbucket":
      return checkBitbucketConnection(env);
    case "wordpress":
      return checkWordPressConnection(env);
    case "ghost":
      return checkGhostConnection(env);
    default:
      return null;
  }
}
