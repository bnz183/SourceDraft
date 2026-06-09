import {
  collapseSlashes,
  trimLeadingSlashes,
  trimSlashes,
  trimTrailingSlashes,
} from "@sourcedraft/core";

export function normalizePublicMediaPath(publicMediaPath: string): string {
  const trimmed = trimTrailingSlashes(publicMediaPath.trim());
  if (trimmed.length === 0) {
    return "/";
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function derivePublicMediaPath(mediaDir: string): string {
  const normalized = trimSlashes(mediaDir.trim());

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
  const cleanFilename = trimLeadingSlashes(filename);
  if (cleanFilename.length === 0) {
    return base;
  }

  return collapseSlashes(`${base}/${cleanFilename}`);
}
