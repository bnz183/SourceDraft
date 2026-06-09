export function isValidRepoPath(path: string): boolean {
  const trimmed = path.trim();
  if (trimmed.length === 0) {
    return false;
  }

  if (trimmed.startsWith("/") || trimmed.includes("..")) {
    return false;
  }

  if (!/^[a-zA-Z0-9._/-]+$/u.test(trimmed)) {
    return false;
  }

  return true;
}

export function isValidPublicMediaPath(path: string): boolean {
  const trimmed = path.trim();
  if (!trimmed.startsWith("/")) {
    return false;
  }

  return isValidRepoPath(trimmed.slice(1));
}
