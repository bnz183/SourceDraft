import { createCloudinaryMediaProvider } from "./cloudinary/cloudinaryProvider.js";
import type {
  MediaProvider,
  MediaProviderFactory,
  MediaProviderRuntimeConfig,
} from "./types.js";

function createCloudinaryProviderFromConfig(
  config: MediaProviderRuntimeConfig,
): MediaProvider {
  const cloudName = config.cloudinaryCloudName?.trim();
  const apiKey = config.cloudinaryApiKey?.trim();
  const apiSecret = config.cloudinaryApiSecret?.trim();

  if (!cloudName) {
    throw new Error("Cloudinary media provider requires CLOUDINARY_CLOUD_NAME in .env.");
  }

  if (!apiKey) {
    throw new Error("Cloudinary media provider requires CLOUDINARY_API_KEY in .env.");
  }

  if (!apiSecret) {
    throw new Error("Cloudinary media provider requires CLOUDINARY_API_SECRET in .env.");
  }

  const provider = createCloudinaryMediaProvider({
    cloudName,
    apiKey,
    apiSecret,
    ...(config.cloudinaryFolder?.trim()
      ? { folder: config.cloudinaryFolder.trim() }
      : {}),
  });

  return provider;
}

export const cloudinaryMediaProviderFactory: MediaProviderFactory = {
  id: "cloudinary",
  createProvider(config: MediaProviderRuntimeConfig): MediaProvider {
    return createCloudinaryProviderFromConfig(config);
  },
};
