import type { PublishMode } from "./publishMode.js";

export type { PublishMode } from "./publishMode.js";
export {
  isPrPublishMode,
  isPublishMode,
  parsePublishMode,
  publishModeSummary,
  PUBLISH_MODES,
} from "./publishMode.js";

export const PUBLISHER_IDS = [
  "github",
  "gitlab",
  "bitbucket",
  "wordpress",
  "ghost",
] as const;

/** Built-in publisher ids; plugins may register additional string ids at runtime. */
export type PublisherId = string;

/** Git publishers commit files to a repository; remote CMS publishers call HTTP APIs. */
export type PublisherKind = "git" | "remote-cms";

export type PublisherRuntimeConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  contentDir: string;
  mediaDir: string;
  publisherOptions?: Record<string, unknown>;
  /** GitLab project id or namespace/project path */
  gitlabProjectRef?: string;
  /** GitLab API base URL (default https://gitlab.com) */
  gitlabBaseUrl?: string;
  /** Bitbucket app-password username when Basic auth is required */
  bitbucketUsername?: string;
  /** WordPress REST API base URL (e.g. https://example.com/wp-json) */
  wordpressApiUrl?: string;
  wordpressUsername?: string;
  wordpressAppPassword?: string;
  wordpressDefaultStatus?: string;
  wordpressDefaultAuthor?: number;
  /** Ghost site URL (e.g. https://example.com) */
  ghostAdminUrl?: string;
  ghostAdminApiKey?: string;
  ghostAcceptVersion?: string;
  ghostDefaultStatus?: string;
};

export type PublisherCapabilities = {
  publishArticle: boolean;
  uploadMedia: boolean;
  listPosts: boolean;
  readPost: boolean;
};

/** Article fields used by remote CMS publishers (WordPress, Ghost). */
export type CmsArticlePayload = {
  title: string;
  slug: string;
  description: string;
  body: string;
  pubDate: string;
  category: string;
  tags: string[];
  draft: boolean;
  updatedDate?: string;
  heroImage?: string;
  author?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  socialImage?: string;
  coverImageAlt?: string;
  noindex?: boolean;
};

export type PublishArticleInput = {
  /** Repo-relative path for git publishers; slug or label for CMS publishers */
  path: string;
  /** Rendered file content for git publishers */
  content: string;
  message: string;
  /** Structured article data for remote CMS publishers */
  article?: CmsArticlePayload;
  /** Remote post ID for CMS updates (WordPress post id, Ghost uuid) */
  remoteId?: string;
  /** GitHub publish mode; ignored by non-GitHub publishers */
  publishMode?: PublishMode;
  /** Article slug for deterministic PR branch naming */
  slug?: string;
  /** PR branch prefix override (default sourcedraft/) */
  prBranchPrefix?: string;
};

export type PublishArticleSuccess = {
  ok: true;
  path: string;
  created: boolean;
  sha: string;
  commitSha: string;
  /** Remote CMS post identifier when applicable */
  remoteId?: string;
  publishMode?: PublishMode;
  prUrl?: string;
  prNumber?: number;
  prBranch?: string;
  baseBranch?: string;
};

export type PublishArticleError = {
  ok: false;
  error: string;
  status?: number;
};

export type PublishArticleResult = PublishArticleSuccess | PublishArticleError;

export type UploadMediaInput = {
  repoPath: string;
  contentBase64: string;
  message: string;
};

export type UploadMediaSuccess = {
  ok: true;
  path: string;
  sha: string;
  commitSha: string;
};

export type UploadMediaError = {
  ok: false;
  error: string;
  status?: number;
};

export type UploadMediaResult = UploadMediaSuccess | UploadMediaError;

export type ListPostsInput = {
  contentDir: string;
};

export type ListedPostFile = {
  path: string;
  name: string;
  sha: string;
  size: number;
};

export type ListPostsSuccess = {
  ok: true;
  files: ListedPostFile[];
};

export type ListPostsError = {
  ok: false;
  error: string;
  status?: number;
};

export type ListPostsResult = ListPostsSuccess | ListPostsError;

export type ReadPostInput = {
  path: string;
};

export type ReadPostSuccess = {
  ok: true;
  path: string;
  content: string;
  sha: string;
};

export type ReadPostError = {
  ok: false;
  error: string;
  status?: number;
};

export type ReadPostResult = ReadPostSuccess | ReadPostError;

/** Sends rendered content and media to a publishing target. */
export type Publisher = {
  id: PublisherId;
  kind: PublisherKind;
  capabilities: PublisherCapabilities;
  publishArticle(input: PublishArticleInput): Promise<PublishArticleResult>;
  uploadMedia(input: UploadMediaInput): Promise<UploadMediaResult>;
  listPosts(input: ListPostsInput): Promise<ListPostsResult>;
  readPost(input: ReadPostInput): Promise<ReadPostResult>;
};

export type PublisherFactory = {
  id: PublisherId;
  kind: PublisherKind;
  capabilities: PublisherCapabilities;
  createPublisher: (config: PublisherRuntimeConfig) => Publisher;
};
