import { branchNameFromSlug } from "./githubBranchNames.js";
import {
  apiError,
  contentsUrl,
  githubHeaders,
  localError,
  readGitHubError,
  repoApiBase,
  type GitHubApiConfig,
  type GitHubApiError,
} from "./githubApi.js";
import { validateGitHubFileBody } from "./githubErrors.js";
import { normalizeRepoPath } from "./githubPaths.js";

export type GitHubPrConfig = GitHubApiConfig & {
  baseBranch: string;
  branchPrefix?: string;
};

export type GitHubPrPublishInput = {
  path: string;
  content: string;
  message: string;
  slug: string;
  draft?: boolean;
};

export type GitHubPrPublishSuccess = {
  ok: true;
  created: boolean;
  path: string;
  sha: string;
  commitSha: string;
  prUrl: string;
  prNumber: number;
  prBranch: string;
  baseBranch: string;
  draft: boolean;
};

export type GitHubPrPublishResult = GitHubPrPublishSuccess | GitHubApiError;

type GitHubRefBody = {
  object?: {
    sha?: string;
  };
};

type GitHubContentBody = {
  sha?: string;
  type?: string;
  content?: string;
  encoding?: string;
};

type GitHubCommitBody = {
  content?: {
    sha?: string;
  };
  commit?: {
    sha?: string;
  };
};

type GitHubPullRequest = {
  number?: number;
  html_url?: string;
  draft?: boolean;
};

function encodeContent(content: string): string {
  return Buffer.from(content, "utf8").toString("base64");
}

function branchRef(branch: string): string {
  return `heads/${branch}`;
}

export async function readBranchRefSha(
  config: GitHubPrConfig,
  branch: string,
): Promise<{ ok: true; sha: string } | GitHubApiError> {
  const response = await fetch(
    `${repoApiBase(config)}/git/ref/${encodeURIComponent(branchRef(branch))}`,
    {
      method: "GET",
      headers: githubHeaders(config.token),
    },
  );

  if (!response.ok) {
    const raw = await readGitHubError(response);
    return apiError(response, raw, "checkFile", config);
  }

  let body: GitHubRefBody;
  try {
    body = (await response.json()) as GitHubRefBody;
  } catch {
    return localError(
      "GitHub returned an unreadable branch ref response.",
      "checkFile",
      config,
      undefined,
      response.status,
    );
  }

  const sha = body.object?.sha;
  if (typeof sha !== "string" || sha.length === 0) {
    return localError(
      "GitHub did not return the base branch commit sha.",
      "checkFile",
      config,
    );
  }

  return { ok: true, sha };
}

export async function ensureBranchRef(
  config: GitHubPrConfig,
  branch: string,
  baseSha: string,
): Promise<{ ok: true; created: boolean } | GitHubApiError> {
  const existing = await readBranchRefSha(config, branch);
  if (existing.ok) {
    return { ok: true, created: false };
  }

  if (existing.status !== 404) {
    return existing;
  }

  const response = await fetch(`${repoApiBase(config)}/git/refs`, {
    method: "POST",
    headers: {
      ...githubHeaders(config.token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ref: `refs/heads/${branch}`,
      sha: baseSha,
    }),
  });

  if (!response.ok) {
    const raw = await readGitHubError(response);
    if (response.status === 422 && raw.toLowerCase().includes("already exists")) {
      return { ok: true, created: false };
    }

    return apiError(response, raw, "publish", config);
  }

  return { ok: true, created: true };
}

export async function getExistingFileShaOnBranch(
  config: GitHubPrConfig,
  path: string,
  branch: string,
): Promise<{ found: true; sha: string } | { found: false } | GitHubApiError> {
  const url = `${contentsUrl(config, path)}?ref=${encodeURIComponent(branch)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: githubHeaders(config.token),
  });

  if (response.status === 404) {
    return { found: false };
  }

  if (!response.ok) {
    const raw = await readGitHubError(response);
    return apiError(response, raw, "checkFile", config, { path });
  }

  let body: GitHubContentBody;
  try {
    body = (await response.json()) as GitHubContentBody;
  } catch {
    return localError(
      "GitHub returned an unreadable file response.",
      "checkFile",
      config,
      { path },
      response.status,
    );
  }

  const validationError = validateGitHubFileBody(body);
  if (validationError !== null) {
    return localError(validationError, "checkFile", config, { path }, response.status);
  }

  return { found: true, sha: body.sha as string };
}

export async function commitFileToBranch(
  config: GitHubPrConfig,
  path: string,
  branch: string,
  contentBase64: string,
  message: string,
  existingSha?: string,
): Promise<
  | { ok: true; created: boolean; path: string; sha: string; commitSha: string }
  | GitHubApiError
> {
  const payload: Record<string, string> = {
    message,
    content: contentBase64,
    branch,
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
    return apiError(response, raw, "publish", config, { path });
  }

  let body: GitHubCommitBody;
  try {
    body = (await response.json()) as GitHubCommitBody;
  } catch {
    return localError(
      "GitHub returned an unreadable publish response.",
      "publish",
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
      "publish",
      config,
      { path },
      response.status,
    );
  }

  if (typeof commitSha !== "string" || commitSha.length === 0) {
    return localError(
      "GitHub did not return the commit sha.",
      "publish",
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

export async function findOpenPullRequest(
  config: GitHubPrConfig,
  headBranch: string,
): Promise<{ ok: true; pr: GitHubPullRequest } | { ok: true; pr: null } | GitHubApiError> {
  const head = `${config.owner}:${headBranch}`;
  const url = `${repoApiBase(config)}/pulls?state=open&head=${encodeURIComponent(head)}&base=${encodeURIComponent(config.baseBranch)}`;
  const response = await fetch(url, {
    method: "GET",
    headers: githubHeaders(config.token),
  });

  if (!response.ok) {
    const raw = await readGitHubError(response);
    return apiError(response, raw, "publish", config);
  }

  let body: GitHubPullRequest[];
  try {
    body = (await response.json()) as GitHubPullRequest[];
  } catch {
    return localError(
      "GitHub returned an unreadable pull request list.",
      "publish",
      config,
      undefined,
      response.status,
    );
  }

  const match = body.find(
    (pr) =>
      typeof pr.number === "number" &&
      typeof pr.html_url === "string" &&
      pr.html_url.length > 0,
  );

  return { ok: true, pr: match ?? null };
}

export async function createPullRequest(
  config: GitHubPrConfig,
  headBranch: string,
  title: string,
  draft: boolean,
): Promise<{ ok: true; pr: GitHubPullRequest } | GitHubApiError> {
  const response = await fetch(`${repoApiBase(config)}/pulls`, {
    method: "POST",
    headers: {
      ...githubHeaders(config.token),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title,
      head: headBranch,
      base: config.baseBranch,
      draft,
    }),
  });

  if (!response.ok) {
    const raw = await readGitHubError(response);
    if (draft && response.status === 422) {
      return {
        ok: false,
        error: `GitHub rejected the draft pull request (422). ${raw || "Draft pull requests may not be supported for this repository."}`,
        status: response.status,
      };
    }

    return apiError(response, raw, "publish", config);
  }

  let body: GitHubPullRequest;
  try {
    body = (await response.json()) as GitHubPullRequest;
  } catch {
    return localError(
      "GitHub returned an unreadable pull request response.",
      "publish",
      config,
      undefined,
      response.status,
    );
  }

  if (typeof body.number !== "number" || typeof body.html_url !== "string") {
    return localError(
      "GitHub did not return pull request metadata.",
      "publish",
      config,
      undefined,
      response.status,
    );
  }

  if (draft && body.draft !== true) {
    return {
      ok: false,
      error:
        "GitHub created a pull request but did not mark it as draft. Draft pull requests are not available for this repository.",
      status: response.status,
    };
  }

  return { ok: true, pr: body };
}

export async function publishFileViaPullRequest(
  config: GitHubPrConfig,
  input: GitHubPrPublishInput,
): Promise<GitHubPrPublishResult> {
  const path = normalizeRepoPath(input.path);
  if (path.length === 0) {
    return { ok: false, error: "Path is required." };
  }

  if (input.message.trim().length === 0) {
    return { ok: false, error: "Commit message is required." };
  }

  const prefix = config.branchPrefix ?? "sourcedraft/";
  const prBranch = branchNameFromSlug(input.slug, prefix);
  const baseRef = await readBranchRefSha(config, config.baseBranch);
  if (!baseRef.ok) {
    return baseRef;
  }

  const branchResult = await ensureBranchRef(config, prBranch, baseRef.sha);
  if (!branchResult.ok) {
    return branchResult;
  }

  const existing = await getExistingFileShaOnBranch(config, path, prBranch);
  if ("ok" in existing) {
    return existing;
  }

  const commitResult = await commitFileToBranch(
    config,
    path,
    prBranch,
    encodeContent(input.content),
    input.message,
    existing.found ? existing.sha : undefined,
  );

  if (!commitResult.ok) {
    return commitResult;
  }

  const existingPr = await findOpenPullRequest(config, prBranch);
  if (!existingPr.ok) {
    return existingPr;
  }

  let pr: GitHubPullRequest;
  if (existingPr.pr !== null) {
    pr = existingPr.pr;
  } else {
    const created = await createPullRequest(
      config,
      prBranch,
      input.message,
      input.draft === true,
    );
    if (!created.ok) {
      return created;
    }
    pr = created.pr;
  }

  return {
    ok: true,
    created: commitResult.created,
    path: commitResult.path,
    sha: commitResult.sha,
    commitSha: commitResult.commitSha,
    prUrl: pr.html_url as string,
    prNumber: pr.number as number,
    prBranch,
    baseBranch: config.baseBranch,
    draft: input.draft === true,
  };
}
