import { requireCmsArticle } from "./cmsPayload.js";
import { DEFAULT_GHOST_ACCEPT_VERSION, createGhostPublisher } from "./ghost/ghostPublisher.js";
import type {
  Publisher,
  PublisherFactory,
  PublisherRuntimeConfig,
  PublishArticleInput,
  PublishArticleResult,
} from "./types.js";
import {
  unsupportedListPosts,
  unsupportedPublishArticle,
  unsupportedReadPost,
  unsupportedUploadMedia,
} from "./unsupported.js";

const GHOST_CAPABILITIES = {
  publishArticle: true,
  uploadMedia: false,
  listPosts: false,
  readPost: false,
} as const;

function resolveGhostConfig(config: PublisherRuntimeConfig) {
  const adminUrl = config.ghostAdminUrl?.trim();
  const adminApiKey = config.ghostAdminApiKey?.trim();

  if (!adminUrl) {
    throw new Error("Ghost publisher requires GHOST_ADMIN_URL in .env.");
  }

  if (!adminApiKey) {
    throw new Error("Ghost publisher requires GHOST_ADMIN_API_KEY in .env.");
  }

  return createGhostPublisher({
    adminUrl,
    adminApiKey,
    acceptVersion: config.ghostAcceptVersion?.trim() || DEFAULT_GHOST_ACCEPT_VERSION,
    defaultStatus: config.ghostDefaultStatus?.trim() || "draft",
  });
}

function createGhostPublisherInstance(config: PublisherRuntimeConfig): Publisher {
  const ghost = resolveGhostConfig(config);

  return {
    id: "ghost",
    kind: "remote-cms",
    capabilities: GHOST_CAPABILITIES,
    async publishArticle(input: PublishArticleInput): Promise<PublishArticleResult> {
      const article = requireCmsArticle(input, "ghost");
      if ("ok" in article) {
        return article;
      }

      const result = await ghost.publishPost({
        article,
        ...(input.remoteId ? { remoteId: input.remoteId } : {}),
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
        remoteId: result.remoteId,
      };
    },
    async uploadMedia() {
      return unsupportedUploadMedia("ghost");
    },
    async listPosts() {
      return unsupportedListPosts("ghost");
    },
    async readPost() {
      return unsupportedReadPost("ghost");
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

export const ghostPublisherFactory: PublisherFactory = {
  id: "ghost",
  kind: "remote-cms",
  capabilities: GHOST_CAPABILITIES,
  createPublisher(config: PublisherRuntimeConfig): Publisher {
    return wrapPublisherWithCapabilities(
      ghostPublisherFactory,
      createGhostPublisherInstance(config),
    );
  },
};
