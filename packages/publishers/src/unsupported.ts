import type { PublisherId } from "./types.js";
import type {
  PublishArticleResult,
  ReadPostResult,
  ListPostsResult,
  UploadMediaResult,
} from "./types.js";

export function unsupportedPublishArticle(
  publisherId: PublisherId,
): PublishArticleResult {
  return {
    ok: false,
    error: `Publisher "${publisherId}" does not support article publishing.`,
  };
}

export function unsupportedUploadMedia(publisherId: PublisherId): UploadMediaResult {
  return {
    ok: false,
    error: `Publisher "${publisherId}" does not support media uploads.`,
  };
}

export function unsupportedListPosts(publisherId: PublisherId): ListPostsResult {
  return {
    ok: false,
    error: `Publisher "${publisherId}" does not support listing posts.`,
  };
}

export function unsupportedReadPost(publisherId: PublisherId): ReadPostResult {
  return {
    ok: false,
    error: `Publisher "${publisherId}" does not support reading posts.`,
  };
}
