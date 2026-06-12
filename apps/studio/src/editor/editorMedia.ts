import {
  CLIENT_ACCEPTED_TYPES,
  clientMaxBytesForFile,
  clientMediaKindForFile,
  uploadMedia,
} from "../lib/media.js";

export type EditorMediaUploadResult =
  | { ok: true; publicPath: string; filename: string; kind: "image" | "pdf" }
  | { ok: false; error: string };

export async function uploadEditorMediaFile(file: File): Promise<EditorMediaUploadResult> {
  const kind = clientMediaKindForFile(file);
  if (kind === null) {
    return {
      ok: false,
      error: "Use a PNG, JPEG, GIF, WebP image, or PDF document.",
    };
  }

  const maxBytes = clientMaxBytesForFile(file);
  if (file.size > maxBytes) {
    return {
      ok: false,
      error:
        kind === "pdf"
          ? "PDF must be 10 MB or smaller."
          : "Image must be 5 MB or smaller.",
    };
  }

  const result = await uploadMedia(file);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  return {
    ok: true,
    publicPath: result.publicPath,
    filename: file.name,
    kind: result.kind,
  };
}

export const EDITOR_IMAGE_ACCEPT = "image/png,image/jpeg,image/gif,image/webp";
export const EDITOR_ATTACHMENT_ACCEPT = CLIENT_ACCEPTED_TYPES.join(",");

export function attachmentLabel(filename: string): string {
  return filename.replace(/\.[^.]+$/u, "") || "Attachment";
}
