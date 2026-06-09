const BRANCH_NAME_MAX_LENGTH = 255;

export function sanitizeBranchSegment(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._/-]+/gu, "-")
    .replace(/-+/gu, "-")
    .replace(/^[-./]+|[-./]+$/gu, "");

  return normalized.length > 0 ? normalized : "post";
}

export function branchNameFromSlug(
  slug: string,
  prefix = "sourcedraft/",
): string {
  const safePrefix = prefix.endsWith("/") ? prefix : `${prefix}/`;
  const segment = sanitizeBranchSegment(slug);
  const branch = `${safePrefix}${segment}`;

  if (branch.length <= BRANCH_NAME_MAX_LENGTH) {
    return branch;
  }

  const maxSegmentLength = BRANCH_NAME_MAX_LENGTH - safePrefix.length;
  return `${safePrefix}${segment.slice(0, Math.max(1, maxSegmentLength))}`;
}

export function slugFromRepoPath(path: string): string {
  const normalized = path.trim().replace(/^\/+/u, "");
  const filename = normalized.split("/").pop() ?? normalized;
  const withoutExtension = filename.replace(/\.[^.]+$/u, "");
  return sanitizeBranchSegment(withoutExtension);
}
