import {
  createPublisher,
  isPublisherId,
  supportedPublisherSummary,
  type Publisher,
  type PublisherId,
  type PublisherRuntimeConfig,
} from "@sourcedraft/publishers";
import type { PublishEnvConfig } from "./config.js";

export function toPublisherRuntimeConfig(
  env: PublishEnvConfig,
): PublisherRuntimeConfig {
  return {
    token: env.token,
    owner: env.owner,
    repo: env.repo,
    branch: env.branch,
    contentDir: env.contentDir,
    mediaDir: env.mediaDir,
    ...(env.publisherOptions !== undefined
      ? { publisherOptions: env.publisherOptions }
      : {}),
  };
}

export function createPublisherFromEnv(env: PublishEnvConfig): Publisher {
  return createPublisher(env.publisher, toPublisherRuntimeConfig(env));
}

export function resolvePublisherId(rawPublisher: string): PublisherId | null {
  if (isPublisherId(rawPublisher)) {
    return rawPublisher;
  }

  return null;
}

export function unknownPublisherError(rawPublisher: string): string {
  return `Unsupported publisher "${rawPublisher}". Supported publishers: ${supportedPublisherSummary()}.`;
}
