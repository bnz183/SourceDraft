import { hasFileExtension, trimLeadingSlashes, trimSlashes } from "@sourcedraft/core";

export function normalizeContentDir(contentDir: string): string {
  return trimSlashes(contentDir).trim();
}

export function safePostPath(
  inputPath: string,
  contentDir: string,
): { ok: true; path: string } | { ok: false; error: string } {
  const normalizedDir = normalizeContentDir(contentDir);
  if (normalizedDir.length === 0) {
    return { ok: false, error: "Content directory is not configured." };
  }

  const path = trimLeadingSlashes(inputPath).trim();
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

  if (!hasFileExtension(path, ["md", "mdx"])) {
    return { ok: false, error: "Post path must end with .md or .mdx." };
  }

  return { ok: true, path };
}
