import { createGitHubPublisher } from "@sourcedraft/github-publisher";
import type {
  Publisher,
  PublisherFactory,
  PublisherRuntimeConfig,
  PublishArticleInput,
  PublishArticleResult,
  ReadPostInput,
  ReadPostResult,
  ListPostsInput,
  ListPostsResult,
  UploadMediaInput,
  UploadMediaResult,
} from "./types.js";
import {
  unsupportedListPosts,
  unsupportedPublishArticle,
  unsupportedReadPost,
  unsupportedUploadMedia,
} from "./unsupported.js";

const GITHUB_CAPABILITIES = {
  publishArticle: true,
  uploadMedia: true,
  listPosts: true,
  readPost: true,
} as const;

function createGitHubPublisherInstance(config: PublisherRuntimeConfig): Publisher {
  const github = createGitHubPublisher({
    token: config.token,
    owner: config.owner,
    repo: config.repo,
    branch: config.branch,
  });

  return {
    id: "github",
    capabilities: GITHUB_CAPABILITIES,
    async publishArticle(input: PublishArticleInput): Promise<PublishArticleResult> {
      const result = await github.publishFile({
        path: input.path,
        content: input.content,
        message: input.message,
        purpose: "post",
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
      const result = await github.publishFile({
        path: input.repoPath,
        contentBase64: input.contentBase64,
        message: input.message,
        purpose: "media",
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
    async listPosts(input: ListPostsInput): Promise<ListPostsResult> {
      const result = await github.listFiles({
        path: input.contentDir,
        contentDir: input.contentDir,
      });

      if (!result.ok) {
        return {
          ok: false,
          error: result.error,
          ...(result.status !== undefined ? { status: result.status } : {}),
        };
      }

      return { ok: true, files: result.files };
    },
    async readPost(input: ReadPostInput): Promise<ReadPostResult> {
      const result = await github.readFile({ path: input.path });

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
        content: result.content,
        sha: result.sha,
      };
    },
  };
}

function wrapPublisherWithCapabilities(
  factory: PublisherFactory,
  publisher: Publisher,
): Publisher {
  return {
    id: factory.id,
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

export const githubPublisherFactory: PublisherFactory = {
  id: "github",
  capabilities: GITHUB_CAPABILITIES,
  createPublisher(config: PublisherRuntimeConfig): Publisher {
    return wrapPublisherWithCapabilities(
      githubPublisherFactory,
      createGitHubPublisherInstance(config),
    );
  },
};
