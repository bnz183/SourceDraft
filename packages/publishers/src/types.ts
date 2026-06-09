export const PUBLISHER_IDS = ["github"] as const;

export type PublisherId = (typeof PUBLISHER_IDS)[number];

export type PublisherRuntimeConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  contentDir: string;
  mediaDir: string;
  publisherOptions?: Record<string, unknown>;
};

export type PublisherCapabilities = {
  publishArticle: boolean;
  uploadMedia: boolean;
  listPosts: boolean;
  readPost: boolean;
};

export type PublishArticleInput = {
  path: string;
  content: string;
  message: string;
};

export type PublishArticleSuccess = {
  ok: true;
  path: string;
  created: boolean;
  sha: string;
  commitSha: string;
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
  capabilities: PublisherCapabilities;
  publishArticle(input: PublishArticleInput): Promise<PublishArticleResult>;
  uploadMedia(input: UploadMediaInput): Promise<UploadMediaResult>;
  listPosts(input: ListPostsInput): Promise<ListPostsResult>;
  readPost(input: ReadPostInput): Promise<ReadPostResult>;
};

export type PublisherFactory = {
  id: PublisherId;
  capabilities: PublisherCapabilities;
  createPublisher: (config: PublisherRuntimeConfig) => Publisher;
};
