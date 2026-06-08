export function encodeGitLabProjectRef(projectRef: string): string {
  return encodeURIComponent(projectRef.trim());
}

export function encodeGitLabFilePath(filePath: string): string {
  return encodeURIComponent(filePath.replace(/^\/+/, "").trim());
}

export function normalizeRepoPath(path: string): string {
  return path.replace(/^\/+/, "").replace(/\/+/g, "/").trim();
}
