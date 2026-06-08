import { loadSourceDraftConfig } from "@sourcedraft/config";
import { isPublisherId } from "@sourcedraft/publishers";

export function isDemoModeForced(): boolean {
  return process.env.SOURCEDRAFT_DEMO_MODE?.trim().toLowerCase() === "true";
}

export function resolveActivePublisher(): string {
  const project = loadSourceDraftConfig();
  const raw = process.env.CMS_PUBLISHER?.trim() || project.publisher;
  return isPublisherId(raw) ? raw : "github";
}

export function isGitHubTokenConfigured(): boolean {
  return (process.env.GITHUB_TOKEN?.trim().length ?? 0) > 0;
}

export function isGitHubOwnerConfigured(): boolean {
  return (process.env.GITHUB_OWNER?.trim().length ?? 0) > 0;
}

export function isGitHubRepoConfigured(): boolean {
  return (process.env.GITHUB_REPO?.trim().length ?? 0) > 0;
}

export function isGitHubConfigured(): boolean {
  return (
    isGitHubTokenConfigured() &&
    isGitHubOwnerConfigured() &&
    isGitHubRepoConfigured()
  );
}

export function isGitLabTokenConfigured(): boolean {
  return (process.env.GITLAB_TOKEN?.trim().length ?? 0) > 0;
}

export function isGitLabProjectConfigured(): boolean {
  const projectId = process.env.GITLAB_PROJECT_ID?.trim();
  const projectPath = process.env.GITLAB_PROJECT_PATH?.trim();
  return (projectId?.length ?? 0) > 0 || (projectPath?.length ?? 0) > 0;
}

export function isGitLabConfigured(): boolean {
  return isGitLabTokenConfigured() && isGitLabProjectConfigured();
}

export function isBitbucketTokenConfigured(): boolean {
  return (process.env.BITBUCKET_TOKEN?.trim().length ?? 0) > 0;
}

export function isBitbucketWorkspaceConfigured(): boolean {
  return (process.env.BITBUCKET_WORKSPACE?.trim().length ?? 0) > 0;
}

export function isBitbucketRepoConfigured(): boolean {
  return (process.env.BITBUCKET_REPO_SLUG?.trim().length ?? 0) > 0;
}

export function isBitbucketConfigured(): boolean {
  return (
    isBitbucketTokenConfigured() &&
    isBitbucketWorkspaceConfigured() &&
    isBitbucketRepoConfigured()
  );
}

export function isPublisherConfigured(): boolean {
  switch (resolveActivePublisher()) {
    case "gitlab":
      return isGitLabConfigured();
    case "bitbucket":
      return isBitbucketConfigured();
    default:
      return isGitHubConfigured();
  }
}

export function isDemoModeAvailable(): boolean {
  if (isDemoModeForced()) {
    return true;
  }

  return !isPublisherConfigured();
}
