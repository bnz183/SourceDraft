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
    ...(env.gitlabProjectRef !== undefined
      ? { gitlabProjectRef: env.gitlabProjectRef }
      : {}),
    ...(env.gitlabBaseUrl !== undefined ? { gitlabBaseUrl: env.gitlabBaseUrl } : {}),
    ...(env.bitbucketUsername !== undefined
      ? { bitbucketUsername: env.bitbucketUsername }
      : {}),
    ...(env.wordpressApiUrl !== undefined ? { wordpressApiUrl: env.wordpressApiUrl } : {}),
    ...(env.wordpressUsername !== undefined
      ? { wordpressUsername: env.wordpressUsername }
      : {}),
    ...(env.wordpressAppPassword !== undefined
      ? { wordpressAppPassword: env.wordpressAppPassword }
      : {}),
    ...(env.wordpressDefaultStatus !== undefined
      ? { wordpressDefaultStatus: env.wordpressDefaultStatus }
      : {}),
    ...(env.wordpressDefaultAuthor !== undefined
      ? { wordpressDefaultAuthor: env.wordpressDefaultAuthor }
      : {}),
    ...(env.ghostAdminUrl !== undefined ? { ghostAdminUrl: env.ghostAdminUrl } : {}),
    ...(env.ghostAdminApiKey !== undefined
      ? { ghostAdminApiKey: env.ghostAdminApiKey }
      : {}),
    ...(env.ghostAcceptVersion !== undefined
      ? { ghostAcceptVersion: env.ghostAcceptVersion }
      : {}),
    ...(env.ghostDefaultStatus !== undefined
      ? { ghostDefaultStatus: env.ghostDefaultStatus }
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
