export function isDemoModeForced(): boolean {
  return process.env.SOURCEDRAFT_DEMO_MODE?.trim().toLowerCase() === "true";
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

export function isDemoModeAvailable(): boolean {
  if (isDemoModeForced()) {
    return true;
  }

  return !isGitHubConfigured();
}
