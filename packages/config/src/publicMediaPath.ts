export function normalizePublicMediaPath(publicMediaPath: string): string {
  const trimmed = publicMediaPath.trim().replace(/\/+$/u, "");
  if (trimmed.length === 0) {
    return "/";
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function derivePublicMediaPath(mediaDir: string): string {
  const normalized = mediaDir.replace(/^\/+/u, "").replace(/\/+$/u, "").trim();

  if (normalized.length === 0) {
    return "/media";
  }

  if (normalized.startsWith("public/")) {
    return normalizePublicMediaPath(`/${normalized.slice("public/".length)}`);
  }

  const leaf = normalized.split("/").pop() ?? "media";
  return `/${leaf}`;
}

export function joinPublicMediaPath(
  publicMediaPath: string,
  filename: string,
): string {
  const base = normalizePublicMediaPath(publicMediaPath);
  const cleanFilename = filename.replace(/^\/+/u, "");
  if (cleanFilename.length === 0) {
    return base;
  }

  return `${base}/${cleanFilename}`.replace(/\/+/gu, "/");
}
