export type MediaKind = "image" | "pdf";

export const IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
] as const;

export const PDF_MIME_TYPES = ["application/pdf"] as const;

export const ALLOWED_MIME_TYPES = new Set<string>([
  ...IMAGE_MIME_TYPES,
  ...PDF_MIME_TYPES,
]);

export const ALLOWED_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "webp",
  "pdf",
]);

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PDF_BYTES = 10 * 1024 * 1024;

const EXTENSION_TO_MIME: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  pdf: "application/pdf",
};

export function normalizeExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex <= 0 || dotIndex === filename.length - 1) {
    return "";
  }

  return filename.slice(dotIndex + 1).toLowerCase();
}

export function mediaKindFromMime(mimeType: string): MediaKind | null {
  if (IMAGE_MIME_TYPES.includes(mimeType as (typeof IMAGE_MIME_TYPES)[number])) {
    return "image";
  }

  if (mimeType === "application/pdf") {
    return "pdf";
  }

  return null;
}

export function mediaKindFromExtension(extension: string): MediaKind | null {
  const normalized = extension.toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(normalized)) {
    return "image";
  }

  if (normalized === "pdf") {
    return "pdf";
  }

  return null;
}

export function isAllowedMediaExtension(extension: string): boolean {
  return ALLOWED_EXTENSIONS.has(extension.toLowerCase());
}

export function isAllowedMediaFilename(filename: string): boolean {
  const extension = normalizeExtension(filename);
  return isAllowedMediaExtension(extension);
}

export function extensionForMime(mimeType: string): string | null {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/gif":
      return "gif";
    case "image/webp":
      return "webp";
    case "application/pdf":
      return "pdf";
    default:
      return null;
  }
}

export function maxBytesForMime(mimeType: string): number | null {
  const kind = mediaKindFromMime(mimeType);
  if (kind === "image") {
    return MAX_IMAGE_BYTES;
  }

  if (kind === "pdf") {
    return MAX_PDF_BYTES;
  }

  return null;
}

export function uploadLimitMessage(mimeType: string): string {
  const kind = mediaKindFromMime(mimeType);
  if (kind === "pdf") {
    return "PDF must be 10 MB or smaller.";
  }

  return "Image must be 5 MB or smaller.";
}

export function allowedTypesMessage(): string {
  return "Only PNG, JPEG, GIF, WebP images and PDF documents are allowed.";
}

export function matchesMediaSignature(
  buffer: Buffer,
  mimeType: string,
): boolean {
  if (buffer.length < 4) {
    return false;
  }

  switch (mimeType) {
    case "image/png":
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
      );
    case "image/jpeg":
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case "image/gif":
      return (
        buffer.length >= 6 &&
        buffer.toString("ascii", 0, 3) === "GIF" &&
        (buffer.toString("ascii", 3, 6) === "87a" ||
          buffer.toString("ascii", 3, 6) === "89a")
      );
    case "image/webp":
      return (
        buffer.length >= 12 &&
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP"
      );
    case "application/pdf":
      return buffer.toString("ascii", 0, 4) === "%PDF";
    default:
      return false;
  }
}

export function mimeMatchesExtension(
  mimeType: string,
  extension: string,
): boolean {
  const expected = EXTENSION_TO_MIME[extension.toLowerCase()];
  if (expected === undefined) {
    return false;
  }

  if (extension === "jpg" || extension === "jpeg") {
    return mimeType === "image/jpeg";
  }

  return expected === mimeType;
}
