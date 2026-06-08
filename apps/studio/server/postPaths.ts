const POST_FILE_PATTERN = /\.(md|mdx)$/iu;

export function normalizeContentDir(contentDir: string): string {
  return contentDir.replace(/^\/+/u, "").replace(/\/+$/u, "").trim();
}

export function safePostPath(
  inputPath: string,
  contentDir: string,
): { ok: true; path: string } | { ok: false; error: string } {
  const normalizedDir = normalizeContentDir(contentDir);
  if (normalizedDir.length === 0) {
    return { ok: false, error: "Content directory is not configured." };
  }

  const path = inputPath.replace(/^\/+/u, "").trim();
  if (path.length === 0) {
    return { ok: false, error: "Path is required." };
  }

  const segments = path.split("/");
  if (segments.some((segment) => segment === ".." || segment === ".")) {
    return { ok: false, error: "Path must not contain . or .. segments." };
  }

  if (!path.startsWith(`${normalizedDir}/`)) {
    return {
      ok: false,
      error: "Path must stay inside the configured content directory.",
    };
  }

  if (!POST_FILE_PATTERN.test(path)) {
    return { ok: false, error: "Post path must end with .md or .mdx." };
  }

  return { ok: true, path };
}
