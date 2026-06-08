export function normalizeRepoPath(path: string): string {
  return path.replace(/^\/+/, "").replace(/\/+/g, "/").trim();
}
