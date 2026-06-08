export const MEDIA_PROVIDER_IDS = ["github-media", "cloudinary", "s3-compatible"] as const;

export type MediaProviderId = (typeof MEDIA_PROVIDER_IDS)[number];

export type MediaUploadInput = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  repoPath: string;
  publicPath: string;
  message: string;
};

export type MediaUploadSuccess = {
  ok: true;
  url: string;
  path: string;
  provider: MediaProviderId;
  metadata?: Record<string, unknown>;
  sha?: string;
  commitSha?: string;
};

export type MediaUploadError = {
  ok: false;
  error: string;
  status?: number;
};

export type MediaUploadResult = MediaUploadSuccess | MediaUploadError;

export type PublisherMediaUpload = (
  input: Pick<MediaUploadInput, "repoPath" | "message"> & { contentBase64: string },
) => Promise<
  | { ok: true; path: string; sha: string; commitSha: string }
  | { ok: false; error: string; status?: number }
>;

export type MediaProviderRuntimeConfig = {
  mediaDir: string;
  publicMediaPath: string;
  publisherUpload?: PublisherMediaUpload;
  cloudinaryCloudName?: string;
  cloudinaryApiKey?: string;
  cloudinaryApiSecret?: string;
  cloudinaryFolder?: string;
  s3Endpoint?: string;
  s3Region?: string;
  s3Bucket?: string;
  s3AccessKeyId?: string;
  s3SecretAccessKey?: string;
  s3PublicBaseUrl?: string;
  s3ForcePathStyle?: boolean;
};

export type MediaProvider = {
  id: MediaProviderId;
  uploadMedia(input: MediaUploadInput): Promise<MediaUploadResult>;
};

export type MediaProviderFactory = {
  id: MediaProviderId;
  createProvider: (config: MediaProviderRuntimeConfig) => MediaProvider;
};
