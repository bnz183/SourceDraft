import "./registerBuiltInMediaProviders.js";

export {
  createMediaProvider,
  getMediaProviderFactory,
  isMediaProviderId,
  listMediaProviderIds,
  mediaProviderRegistry,
  registerMediaProvider,
  supportedMediaProviderSummary,
} from "./mediaProviderRegistry.js";

export { validateS3MediaConfig } from "./s3/s3Config.js";
export { buildCloudinarySignature } from "./cloudinary/cloudinarySignature.js";

export {
  MEDIA_PROVIDER_IDS,
  type MediaProvider,
  type MediaProviderFactory,
  type MediaProviderId,
  type MediaProviderRuntimeConfig,
  type MediaUploadInput,
  type MediaUploadResult,
  type MediaUploadSuccess,
  type PublisherMediaUpload,
} from "./types.js";
