export type S3MediaConfig = {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicBaseUrl?: string;
  forcePathStyle?: boolean;
};

export type S3ConfigValidationResult =
  | { ok: true; config: S3MediaConfig }
  | { ok: false; error: string };

export function validateS3MediaConfig(input: {
  endpoint?: string;
  region?: string;
  bucket?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  publicBaseUrl?: string;
  forcePathStyle?: boolean;
}): S3ConfigValidationResult {
  const endpoint = input.endpoint?.trim();
  const region = input.region?.trim();
  const bucket = input.bucket?.trim();
  const accessKeyId = input.accessKeyId?.trim();
  const secretAccessKey = input.secretAccessKey?.trim();

  if (!endpoint) {
    return { ok: false, error: "S3_ENDPOINT is not configured." };
  }

  if (!region) {
    return { ok: false, error: "S3_REGION is not configured." };
  }

  if (!bucket) {
    return { ok: false, error: "S3_BUCKET is not configured." };
  }

  if (!accessKeyId) {
    return { ok: false, error: "S3_ACCESS_KEY_ID is not configured." };
  }

  if (!secretAccessKey) {
    return { ok: false, error: "S3_SECRET_ACCESS_KEY is not configured." };
  }

  try {
    new URL(endpoint);
  } catch {
    return {
      ok: false,
      error: "S3_ENDPOINT must be a valid URL (e.g. https://account.r2.cloudflarestorage.com).",
    };
  }

  return {
    ok: true,
    config: {
      endpoint: endpoint.replace(/\/+$/, ""),
      region,
      bucket,
      accessKeyId,
      secretAccessKey,
      ...(input.publicBaseUrl?.trim()
        ? { publicBaseUrl: input.publicBaseUrl.trim().replace(/\/+$/, "") }
        : {}),
      ...(input.forcePathStyle === true ? { forcePathStyle: true } : {}),
    },
  };
}
