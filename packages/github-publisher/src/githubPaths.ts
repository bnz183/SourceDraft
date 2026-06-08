export function normalizeRepoPath(path: string): string {
  return path.trim().replace(/^\/+/u, "");
}

export function encodeRepoPath(path: string): string {
  return path
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}
