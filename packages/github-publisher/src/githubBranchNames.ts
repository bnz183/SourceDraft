const BRANCH_NAME_MAX_LENGTH = 255;

function isAllowedBranchChar(char: string): boolean {
  const code = char.charCodeAt(0);
  return (
    (code >= 97 && code <= 122) ||
    (code >= 48 && code <= 57) ||
    char === "." ||
    char === "_" ||
    char === "/" ||
    char === "-"
  );
}

function isTrimChar(char: string | undefined): boolean {
  return char === "-" || char === "." || char === "/";
}

export function sanitizeBranchSegment(value: string): string {
  const chars: string[] = [];

  for (const char of value.trim().toLowerCase()) {
    if (isAllowedBranchChar(char)) {
      if (char === "-") {
        if (chars[chars.length - 1] !== "-") {
          chars.push(char);
        }
      } else {
        chars.push(char);
      }
      continue;
    }

    if (chars.length > 0 && chars[chars.length - 1] !== "-") {
      chars.push("-");
    }
  }

  while (isTrimChar(chars[0])) {
    chars.shift();
  }

  while (chars.length > 0 && isTrimChar(chars[chars.length - 1])) {
    chars.pop();
  }

  return chars.length > 0 ? chars.join("") : "post";
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
