function sanitizeBranchSegment(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._/-]+/gu, "-")
    .replace(/-+/gu, "-")
    .replace(/^[-./]+|[-./]+$/gu, "");

  return normalized.length > 0 ? normalized : "post";
}

export function previewPrBranch(slug: string, prefix: string): string {
  const safePrefix = prefix.endsWith("/") ? prefix : `${prefix}/`;
  const segment = sanitizeBranchSegment(slug);
  const branch = `${safePrefix}${segment}`;

  if (branch.length <= 255) {
    return branch;
  }

  const maxSegmentLength = 255 - safePrefix.length;
  return `${safePrefix}${segment.slice(0, Math.max(1, maxSegmentLength))}`;
}
