import { createBitbucketPublisher } from "./bitbucket/bitbucketPublisher.js";
import type {
  Publisher,
  PublisherFactory,
  PublisherRuntimeConfig,
  PublishArticleInput,
  PublishArticleResult,
  UploadMediaInput,
  UploadMediaResult,
} from "./types.js";
import {
  unsupportedListPosts,
  unsupportedPublishArticle,
  unsupportedReadPost,
  unsupportedUploadMedia,
} from "./unsupported.js";

const BITBUCKET_CAPABILITIES = {
  publishArticle: true,
  uploadMedia: true,
  listPosts: false,
  readPost: false,
} as const;

function resolveBitbucketConfig(config: PublisherRuntimeConfig) {
  const workspace = config.owner?.trim();
  const repoSlug = config.repo?.trim();

  if (!workspace) {
    throw new Error("Bitbucket publisher requires BITBUCKET_WORKSPACE in .env.");
  }

  if (!repoSlug) {
    throw new Error("Bitbucket publisher requires BITBUCKET_REPO_SLUG in .env.");
  }

  if (!config.token) {
    throw new Error("Bitbucket publisher requires BITBUCKET_TOKEN in .env.");
  }

  return createBitbucketPublisher({
    token: config.token,
    workspace,
    repoSlug,
    branch: config.branch,
    ...(config.bitbucketUsername?.trim()
      ? { username: config.bitbucketUsername.trim() }
      : {}),
  });
}

function createBitbucketPublisherInstance(config: PublisherRuntimeConfig): Publisher {
  const bitbucket = resolveBitbucketConfig(config);

  return {
    id: "bitbucket",
    kind: "git",
    capabilities: BITBUCKET_CAPABILITIES,
    async publishArticle(input: PublishArticleInput): Promise<PublishArticleResult> {
      const result = await bitbucket.publishFile({
        path: input.path,
        content: input.content,
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
        created: result.created,
        sha: result.sha,
        commitSha: result.commitSha,
      };
    },
    async uploadMedia(input: UploadMediaInput): Promise<UploadMediaResult> {
      const result = await bitbucket.publishFile({
        path: input.repoPath,
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
    async listPosts() {
      return unsupportedListPosts("bitbucket");
    },
    async readPost() {
      return unsupportedReadPost("bitbucket");
    },
  };
}

function wrapPublisherWithCapabilities(
  factory: PublisherFactory,
  publisher: Publisher,
): Publisher {
  return {
    id: factory.id,
    kind: factory.kind,
    capabilities: factory.capabilities,
    publishArticle: factory.capabilities.publishArticle
      ? (input) => publisher.publishArticle(input)
      : () => Promise.resolve(unsupportedPublishArticle(factory.id)),
    uploadMedia: factory.capabilities.uploadMedia
      ? (input) => publisher.uploadMedia(input)
      : () => Promise.resolve(unsupportedUploadMedia(factory.id)),
    listPosts: factory.capabilities.listPosts
      ? (input) => publisher.listPosts(input)
      : () => Promise.resolve(unsupportedListPosts(factory.id)),
    readPost: factory.capabilities.readPost
      ? (input) => publisher.readPost(input)
      : () => Promise.resolve(unsupportedReadPost(factory.id)),
  };
}

export const bitbucketPublisherFactory: PublisherFactory = {
  id: "bitbucket",
  kind: "git",
  capabilities: BITBUCKET_CAPABILITIES,
  createPublisher(config: PublisherRuntimeConfig): Publisher {
    return wrapPublisherWithCapabilities(
      bitbucketPublisherFactory,
      createBitbucketPublisherInstance(config),
    );
  },
};
