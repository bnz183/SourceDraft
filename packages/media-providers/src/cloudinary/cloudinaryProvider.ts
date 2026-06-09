import { resolveFetcher, type HttpFetcher, readResponseBody } from "../http.js";
import type { MediaUploadInput, MediaUploadResult } from "../types.js";
import { buildCloudinarySignature } from "./cloudinarySignature.js";

const IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

export type CloudinaryProviderConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder?: string;
  fetch?: HttpFetcher;
};

type CloudinaryUploadBody = {
  secure_url?: string;
  public_id?: string;
  bytes?: number;
  format?: string;
  error?: { message?: string };
};

export function createCloudinaryMediaProvider(
  config: CloudinaryProviderConfig,
): {
  id: "cloudinary";
  uploadMedia: (input: MediaUploadInput) => Promise<MediaUploadResult>;
} {
  const fetchImpl = resolveFetcher(config.fetch);

  return {
    id: "cloudinary",
    async uploadMedia(input: MediaUploadInput): Promise<MediaUploadResult> {
      if (!IMAGE_MIME_TYPES.has(input.mimeType)) {
        return {
          ok: false,
          error:
            "Cloudinary media provider supports PNG, JPEG, GIF, and WebP images only. Use github-media for PDFs or other types.",
        };
      }

      const timestamp = Math.round(Date.now() / 1000);
      const signatureParams: Record<string, string | number> = { timestamp };
      if (config.folder) {
        signatureParams.folder = config.folder;
      }

      const signature = buildCloudinarySignature(signatureParams, config.apiSecret);
      const form = new FormData();
      form.set(
        "file",
        new Blob([Uint8Array.from(input.buffer)], { type: input.mimeType }),
        input.filename,
      );
      form.set("api_key", config.apiKey);
      form.set("timestamp", String(timestamp));
      form.set("signature", signature);
      if (config.folder) {
        form.set("folder", config.folder);
      }

      const response = await fetchImpl(
        `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/upload`,
        {
          method: "POST",
          body: form,
        },
      );

      const bodyText = await readResponseBody(response);
      let body: CloudinaryUploadBody | null = null;
      try {
        body = JSON.parse(bodyText) as CloudinaryUploadBody;
      } catch {
        body = null;
      }

      if (!response.ok) {
        const message = body?.error?.message ?? bodyText.trim() ?? "Cloudinary upload failed.";
        if (response.status === 401) {
          return {
            ok: false,
            error:
              "Cloudinary rejected the credentials (401). Check CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env.",
            status: 401,
          };
        }

        return {
          ok: false,
          error: `Cloudinary upload failed (${response.status}): ${message}`,
          status: response.status,
        };
      }

      const secureUrl = body?.secure_url;
      const publicId = body?.public_id;

      if (!secureUrl || !publicId) {
        return {
          ok: false,
          error: "Cloudinary upload succeeded but did not return a secure URL.",
        };
      }

      return {
        ok: true,
        url: secureUrl,
        path: publicId,
        provider: "cloudinary",
        metadata: {
          format: body?.format,
          bytes: body?.bytes,
        },
      };
    },
  };
}
