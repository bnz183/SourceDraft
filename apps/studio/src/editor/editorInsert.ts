// Pure helpers for the editor insert dialogs (link / image / file). Kept free
// of React and Tiptap so they can be unit-tested directly.

const ABSOLUTE_OR_RELATIVE =
  /^(https?:|mailto:|tel:|\/|#|\.\/|\.\.\/)/iu;
const BARE_DOMAIN = /^[\w-]+(?:\.[\w-]+)+(?:[/?#].*)?$/u;

/**
 * Normalize a user-entered URL. Bare domains (example.com/x) gain an https://
 * scheme; absolute URLs, mailto:/tel:, anchors and relative paths are kept.
 * Returns "" for blank input.
 */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return "";
  }
  if (ABSOLUTE_OR_RELATIVE.test(trimmed)) {
    return trimmed;
  }
  if (BARE_DOMAIN.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

/** Human-friendly label for a file path: basename without a .pdf suffix. */
export function fileLabelFromPath(path: string): string {
  const base = path.split("/").pop() ?? path;
  return base.replace(/\.pdf$/iu, "") || base;
}

/** Whether a normalized URL is non-empty (i.e. safe to insert). */
export function hasUrl(input: string): boolean {
  return normalizeUrl(input).length > 0;
}
