import { trimLeadingSlashes, trimSlashes } from "@sourcedraft/core";
import {
  isAllowedMediaExtension,
  normalizeExtension,
} from "./mediaValidation.js";

export function normalizeMediaDir(mediaDir: string): string {
  return trimSlashes(mediaDir).trim();
}

export function safeMediaPath(
  inputPath: string,
  mediaDir: string,
): { ok: true; path: string } | { ok: false; error: string } {
  const normalizedDir = normalizeMediaDir(mediaDir);
  if (normalizedDir.length === 0) {
    return { ok: false, error: "Media directory is not configured." };
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
      error: "Path must stay inside the configured media directory.",
    };
  }

  const filename = segments.at(-1) ?? "";
  const extension = normalizeExtension(filename);
  if (!isAllowedMediaExtension(extension)) {
    return { ok: false, error: "File type is not allowed for media library." };
  }

  return { ok: true, path };
}

export function filenameFromRepoPath(repoPath: string): string {
  return repoPath.split("/").pop() ?? repoPath;
}
