import { validateS3MediaConfig } from "./s3Config.js";
import type { MediaUploadInput, MediaUploadResult } from "../types.js";

export function createS3MediaProvider(config: {
  endpoint?: string;
  region?: string;
  bucket?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  publicBaseUrl?: string;
  forcePathStyle?: boolean;
}): {
  id: "s3-compatible";
  uploadMedia: (input: MediaUploadInput) => Promise<MediaUploadResult>;
} {
  const validated = validateS3MediaConfig(config);

  return {
    id: "s3-compatible",
    async uploadMedia(_input: MediaUploadInput): Promise<MediaUploadResult> {
      if (!validated.ok) {
        return validated;
      }

      return {
        ok: false,
        error:
          "S3-compatible media upload is experimental and not implemented yet. Configure Cloudinary or github-media for uploads today. See docs/media.md.",
      };
    },
  };
}
