import { createS3MediaProvider } from "./s3/s3Provider.js";
import type {
  MediaProvider,
  MediaProviderFactory,
  MediaProviderRuntimeConfig,
} from "./types.js";

export const s3MediaProviderFactory: MediaProviderFactory = {
  id: "s3-compatible",
  createProvider(config: MediaProviderRuntimeConfig): MediaProvider {
    const s3Config: {
      endpoint?: string;
      region?: string;
      bucket?: string;
      accessKeyId?: string;
      secretAccessKey?: string;
      publicBaseUrl?: string;
      forcePathStyle?: boolean;
    } = {};

    if (config.s3Endpoint !== undefined) {
      s3Config.endpoint = config.s3Endpoint;
    }
    if (config.s3Region !== undefined) {
      s3Config.region = config.s3Region;
    }
    if (config.s3Bucket !== undefined) {
      s3Config.bucket = config.s3Bucket;
    }
    if (config.s3AccessKeyId !== undefined) {
      s3Config.accessKeyId = config.s3AccessKeyId;
    }
    if (config.s3SecretAccessKey !== undefined) {
      s3Config.secretAccessKey = config.s3SecretAccessKey;
    }
    if (config.s3PublicBaseUrl !== undefined) {
      s3Config.publicBaseUrl = config.s3PublicBaseUrl;
    }
    if (config.s3ForcePathStyle === true) {
      s3Config.forcePathStyle = true;
    }

    return createS3MediaProvider(s3Config);
  },
};
