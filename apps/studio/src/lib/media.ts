export type MediaKind = "image" | "pdf";

export type MediaFile = {
  repoPath: string;
  publicPath: string;
  filename: string;
  extension: string;
  kind: MediaKind;
  size: number;
};

export type FetchMediaSuccess = {
  ok: true;
  files: MediaFile[];
};

export type FetchMediaError = {
  ok: false;
  error: string;
};

export type FetchMediaResponse = FetchMediaSuccess | FetchMediaError;

export type MediaUploadSuccess = {
  ok: true;
  repoPath: string;
  publicPath: string;
  kind: MediaKind;
  url: string;
  provider: string;
  sha: string;
  commitSha: string;
  metadata?: Record<string, unknown>;
};

export type MediaUploadError = {
  ok: false;
  error: string;
};

export type MediaUploadResponse = MediaUploadSuccess | MediaUploadError;

export const CLIENT_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
] as const;

export const CLIENT_ACCEPTED_TYPES = [
  ...CLIENT_IMAGE_TYPES,
  "application/pdf",
] as const;

export const CLIENT_MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const CLIENT_MAX_PDF_BYTES = 10 * 1024 * 1024;

export function clientMaxBytesForFile(file: File): number {
  return file.type === "application/pdf"
    ? CLIENT_MAX_PDF_BYTES
    : CLIENT_MAX_IMAGE_BYTES;
}

export function clientMediaKindForFile(file: File): MediaKind | null {
  if (CLIENT_IMAGE_TYPES.includes(file.type as (typeof CLIENT_IMAGE_TYPES)[number])) {
    return "image";
  }

  if (file.type === "application/pdf") {
    return "pdf";
  }

  return null;
}

export function formatMediaSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function fetchMediaLibrary(): Promise<FetchMediaResponse> {
  try {
    const response = await fetch("/api/media", { credentials: "include" });
    const data = (await response.json()) as FetchMediaResponse;

    if (!response.ok || !data.ok) {
      return data.ok
        ? {
            ok: false,
            error:
              "Could not load media library. Check token, owner/repo, and mediaDir.",
          }
        : data;
    }

    return data;
  } catch {
    return {
      ok: false,
      error: "Could not reach the media API. Is the server running?",
    };
  }
}

export async function uploadMedia(file: File): Promise<MediaUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/api/media/upload", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = (await response.json()) as MediaUploadResponse;

    if (!response.ok || !data.ok) {
      return data.ok
        ? {
            ok: false,
            error:
              "Media upload failed. Check token, owner/repo, and mediaDir.",
          }
        : data;
    }

    return data;
  } catch {
    return {
      ok: false,
      error: "Could not reach the upload API. Is the server running?",
    };
  }
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
