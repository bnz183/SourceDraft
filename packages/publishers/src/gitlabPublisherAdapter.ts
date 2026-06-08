import { createGitLabPublisher } from "./gitlab/gitlabPublisher.js";
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

const GITLAB_CAPABILITIES = {
  publishArticle: true,
  uploadMedia: true,
  listPosts: true,
  readPost: true,
} as const;

const DEFAULT_GITLAB_BASE_URL = "https://gitlab.com";

function resolveGitLabConfig(config: PublisherRuntimeConfig) {
  const projectRef = config.gitlabProjectRef?.trim();
  if (!projectRef) {
    throw new Error(
      "GitLab publisher requires gitlabProjectRef (set GITLAB_PROJECT_ID or GITLAB_PROJECT_PATH in .env).",
    );
  }

  if (!config.token) {
    throw new Error("GitLab publisher requires GITLAB_TOKEN in .env.");
  }

  const options = config.publisherOptions ?? {};
  const authorName =
    typeof options.authorName === "string" ? options.authorName : undefined;
  const authorEmail =
    typeof options.authorEmail === "string" ? options.authorEmail : undefined;

  return createGitLabPublisher({
    token: config.token,
    projectRef,
    branch: config.branch,
    baseUrl: config.gitlabBaseUrl?.trim() || DEFAULT_GITLAB_BASE_URL,
    ...(authorName ? { authorName } : {}),
    ...(authorEmail ? { authorEmail } : {}),
  });
}

function createGitLabPublisherInstance(config: PublisherRuntimeConfig): Publisher {
  const gitlab = resolveGitLabConfig(config);

  return {
    id: "gitlab",
    capabilities: GITLAB_CAPABILITIES,
    async publishArticle(input: PublishArticleInput): Promise<PublishArticleResult> {
      const result = await gitlab.publishFile({
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
      const result = await gitlab.publishFile({
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
    async listPosts(input: ListPostsInput): Promise<ListPostsResult> {
      const result = await gitlab.listFiles({
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
      const result = await gitlab.readFile({ path: input.path });

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

export const gitlabPublisherFactory: PublisherFactory = {
  id: "gitlab",
  capabilities: GITLAB_CAPABILITIES,
  createPublisher(config: PublisherRuntimeConfig): Publisher {
    return wrapPublisherWithCapabilities(
      gitlabPublisherFactory,
      createGitLabPublisherInstance(config),
    );
  },
};
