import { requireCmsArticle } from "./cmsPayload.js";
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
import { createWordPressPublisher } from "./wordpress/wordpressPublisher.js";

const WORDPRESS_CAPABILITIES = {
  publishArticle: true,
  uploadMedia: false,
  listPosts: false,
  readPost: false,
} as const;

function readTaxonomyMap(
  options: Record<string, unknown>,
  key: string,
): Record<string, number> | undefined {
  const raw = options[key];
  if (!raw || typeof raw !== "object") {
    return undefined;
  }

  const map: Record<string, number> = {};
  for (const [name, value] of Object.entries(raw)) {
    if (typeof value === "number" && value > 0) {
      map[name] = value;
    }
  }

  return Object.keys(map).length > 0 ? map : undefined;
}

function resolveWordPressConfig(config: PublisherRuntimeConfig) {
  const apiUrl = config.wordpressApiUrl?.trim();
  const username = config.wordpressUsername?.trim();
  const appPassword = config.wordpressAppPassword?.trim();

  if (!apiUrl) {
    throw new Error("WordPress publisher requires WORDPRESS_API_URL in .env.");
  }

  if (!username) {
    throw new Error("WordPress publisher requires WORDPRESS_USERNAME in .env.");
  }

  if (!appPassword) {
    throw new Error("WordPress publisher requires WORDPRESS_APP_PASSWORD in .env.");
  }

  const options = config.publisherOptions ?? {};
  const categoryIds = readTaxonomyMap(options, "wordpressCategoryIds");
  const tagIds = readTaxonomyMap(options, "wordpressTagIds");

  return createWordPressPublisher({
    apiUrl,
    username,
    appPassword,
    defaultStatus: config.wordpressDefaultStatus?.trim() || "draft",
    ...(config.wordpressDefaultAuthor !== undefined
      ? { defaultAuthor: config.wordpressDefaultAuthor }
      : {}),
    ...(categoryIds !== undefined ? { categoryIds } : {}),
    ...(tagIds !== undefined ? { tagIds } : {}),
  });
}

function createWordPressPublisherInstance(config: PublisherRuntimeConfig): Publisher {
  const wordpress = resolveWordPressConfig(config);

  return {
    id: "wordpress",
    kind: "remote-cms",
    capabilities: WORDPRESS_CAPABILITIES,
    async publishArticle(input: PublishArticleInput): Promise<PublishArticleResult> {
      const article = requireCmsArticle(input, "wordpress");
      if ("ok" in article) {
        return article;
      }

      const result = await wordpress.publishPost({
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
      return unsupportedUploadMedia("wordpress");
    },
    async listPosts() {
      return unsupportedListPosts("wordpress");
    },
    async readPost() {
      return unsupportedReadPost("wordpress");
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

export const wordpressPublisherFactory: PublisherFactory = {
  id: "wordpress",
  kind: "remote-cms",
  capabilities: WORDPRESS_CAPABILITIES,
  createPublisher(config: PublisherRuntimeConfig): Publisher {
    return wrapPublisherWithCapabilities(
      wordpressPublisherFactory,
      createWordPressPublisherInstance(config),
    );
  },
};
