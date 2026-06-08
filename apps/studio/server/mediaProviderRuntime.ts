import {
  createMediaProvider,
  isMediaProviderId,
  type MediaProvider,
  type MediaProviderId,
  type MediaProviderRuntimeConfig,
} from "@sourcedraft/media-providers";
import type { PublishEnvConfig } from "./config.js";
import { createPublisherFromEnv } from "./publisherRuntime.js";

export function resolveMediaProviderId(): MediaProviderId {
  const raw = process.env.CMS_MEDIA_PROVIDER?.trim() || "github-media";
  return isMediaProviderId(raw) ? raw : "github-media";
}

export function createMediaProviderFromEnv(env: PublishEnvConfig): MediaProvider {
  const providerId = resolveMediaProviderId();
  const config = toMediaProviderRuntimeConfig(env, providerId);
  return createMediaProvider(providerId, config);
}

function toMediaProviderRuntimeConfig(
  env: PublishEnvConfig,
  providerId: MediaProviderId,
): MediaProviderRuntimeConfig {
  const base: MediaProviderRuntimeConfig = {
    mediaDir: env.mediaDir,
    publicMediaPath: env.publicMediaPath,
  };

  if (providerId === "github-media") {
    const publisher = createPublisherFromEnv(env);
    return {
      ...base,
      publisherUpload: async (input) => {
        const result = await publisher.uploadMedia({
          repoPath: input.repoPath,
          contentBase64: input.contentBase64,
          message: input.message,
        });

        if (!result.ok) {
          return {
            ok: false,
            error: result.error,
            ...(result.status !== undefined ? { status: result.status } : {}),
          };
        }

        return {
          ok: true,
          path: result.path,
          sha: result.sha,
          commitSha: result.commitSha,
        };
      },
    };
  }

  if (providerId === "cloudinary") {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
    const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
    const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
    const folder = process.env.CLOUDINARY_FOLDER?.trim();

    return {
      ...base,
      ...(cloudName ? { cloudinaryCloudName: cloudName } : {}),
      ...(apiKey ? { cloudinaryApiKey: apiKey } : {}),
      ...(apiSecret ? { cloudinaryApiSecret: apiSecret } : {}),
      ...(folder ? { cloudinaryFolder: folder } : {}),
    };
  }

  const s3Endpoint = process.env.S3_ENDPOINT?.trim();
  const s3Region = process.env.S3_REGION?.trim();
  const s3Bucket = process.env.S3_BUCKET?.trim();
  const s3AccessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const s3SecretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
  const s3PublicBaseUrl = process.env.S3_PUBLIC_BASE_URL?.trim();
  const s3ForcePathStyle =
    process.env.S3_FORCE_PATH_STYLE?.trim().toLowerCase() === "true";

  return {
    ...base,
    ...(s3Endpoint ? { s3Endpoint } : {}),
    ...(s3Region ? { s3Region } : {}),
    ...(s3Bucket ? { s3Bucket } : {}),
    ...(s3AccessKeyId ? { s3AccessKeyId } : {}),
    ...(s3SecretAccessKey ? { s3SecretAccessKey } : {}),
    ...(s3PublicBaseUrl ? { s3PublicBaseUrl } : {}),
    ...(s3ForcePathStyle ? { s3ForcePathStyle: true } : {}),
  };
}
