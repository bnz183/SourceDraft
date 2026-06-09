import { cloudinaryMediaProviderFactory } from "./cloudinaryMediaProvider.js";
import { githubMediaProviderFactory } from "./githubMediaProvider.js";
import { registerMediaProvider } from "./mediaProviderRegistry.js";
import { s3MediaProviderFactory } from "./s3MediaProvider.js";

export function registerBuiltInMediaProviders(): void {
  registerMediaProvider(githubMediaProviderFactory);
  registerMediaProvider(cloudinaryMediaProviderFactory);
  registerMediaProvider(s3MediaProviderFactory);
}

registerBuiltInMediaProviders();
