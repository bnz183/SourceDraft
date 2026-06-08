import {
  resolveMetaDescription,
  resolveMetaTitle,
  resolveSocialImage,
} from "@sourcedraft/core";
import { resolveCmsStatus, resolveFeatureImageUrl } from "../cmsPayload.js";
import {
  type HttpFetcher,
  parseJsonBody,
  readResponseBody,
  resolveFetcher,
} from "../http.js";
import type { CmsArticlePayload } from "../types.js";
import { createGhostAdminJwt } from "./ghostJwt.js";
import { formatGhostApiError, type GhostOperation } from "./ghostErrors.js";

export const DEFAULT_GHOST_ACCEPT_VERSION = "v5.126";

export type GhostPublisherConfig = {
  adminUrl: string;
  adminApiKey: string;
  acceptVersion: string;
  defaultStatus: string;
  fetch?: HttpFetcher;
};

type GhostPost = {
  id?: string;
  slug?: string;
  url?: string;
  status?: string;
};

type GhostPostsResponse = {
  posts?: GhostPost[];
};

export type PublishPostInput = {
  article: CmsArticlePayload;
  remoteId?: string;
};

export type PublishPostSuccess = {
  ok: true;
  created: boolean;
  path: string;
  sha: string;
  commitSha: string;
  remoteId: string;
};

export type PublishPostError = {
  ok: false;
  error: string;
  status?: number;
};

export type PublishPostResult = PublishPostSuccess | PublishPostError;

export type GhostPublisher = {
  publishPost: (input: PublishPostInput) => Promise<PublishPostResult>;
};

function trimAdminUrl(adminUrl: string): string {
  return adminUrl.replace(/\/+$/, "");
}

function ghostErrorMessage(body: unknown, fallback: string): string {
  if (Array.isArray(body) && body.length > 0) {
    const first = body[0] as { message?: string };
    if (first.message) {
      return first.message;
    }
  }

  if (typeof body === "object" && body !== null) {
    const record = body as { errors?: { message?: string }[] };
    const message = record.errors?.[0]?.message;
    if (message) {
      return message;
    }
  }

  return fallback;
}

function buildGhostPostPayload(
  article: CmsArticlePayload,
  defaultStatus: string,
): Record<string, unknown> {
  const status = resolveCmsStatus(article.draft, defaultStatus);
  const featureImage = resolveFeatureImageUrl(article);

  const post: Record<string, unknown> = {
    title: article.title,
    slug: article.slug,
    html: article.body,
    status,
    excerpt: article.description,
    tags: article.tags.map((name) => ({ name })),
  };

  if (featureImage) {
    post.feature_image = featureImage;
  }

  const metaTitle = resolveMetaTitle({
    title: article.title,
    ...(article.metaTitle !== undefined ? { metaTitle: article.metaTitle } : {}),
  });
  const metaDescription = resolveMetaDescription({
    description: article.description,
    ...(article.metaDescription !== undefined
      ? { metaDescription: article.metaDescription }
      : {}),
  });

  post.meta_title = metaTitle;
  post.meta_description = metaDescription;

  if (article.canonicalUrl) {
    post.canonical_url = article.canonicalUrl;
  }

  if (article.coverImageAlt) {
    post.feature_image_alt = article.coverImageAlt;
  }

  const socialImage = resolveSocialImage({
    ...(article.heroImage !== undefined ? { heroImage: article.heroImage } : {}),
    ...(article.socialImage !== undefined ? { socialImage: article.socialImage } : {}),
  });
  if (
    socialImage &&
    /^https?:\/\//iu.test(socialImage) &&
    socialImage !== featureImage
  ) {
    post.og_image = socialImage;
  }

  if (article.updatedDate) {
    post.updated_at = article.updatedDate;
  }

  return post;
}

export function createGhostPublisher(config: GhostPublisherConfig): GhostPublisher {
  const fetchImpl = resolveFetcher(config.fetch);
  const adminBase = trimAdminUrl(config.adminUrl);

  async function ghostRequest(
    method: string,
    path: string,
    operation: GhostOperation,
    body?: Record<string, unknown>,
    postId?: string,
  ): Promise<{ ok: true; bodyText: string } | PublishPostError> {
    const jwt = createGhostAdminJwt(config.adminApiKey);
    if ("ok" in jwt) {
      return jwt;
    }

    const response = await fetchImpl(`${adminBase}${path}`, {
      method,
      headers: {
        Authorization: `Ghost ${jwt.token}`,
        Accept: "application/json",
        "Content-Type": "application/json",
        "Accept-Version": config.acceptVersion,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const bodyText = await readResponseBody(response);

    if (!response.ok) {
      const parsed = parseJsonBody<unknown>(bodyText);
      return {
        ok: false,
        error: formatGhostApiError(
          response.status,
          ghostErrorMessage(parsed, bodyText),
          operation,
          {
            adminUrl: adminBase,
            ...(postId !== undefined ? { postId } : {}),
          },
        ),
        status: response.status,
      };
    }

    return { ok: true, bodyText };
  }

  function parsePostResponse(bodyText: string, fallbackSlug: string): PublishPostSuccess | PublishPostError {
    const body = parseJsonBody<GhostPostsResponse>(bodyText);
    const post = body?.posts?.[0];
    const id = post?.id ?? "";

    if (id.length === 0) {
      return {
        ok: false,
        error: "Ghost returned a response without a post id.",
      };
    }

    return {
      ok: true,
      created: true,
      path: post?.slug ?? fallbackSlug,
      sha: id,
      commitSha: id,
      remoteId: id,
    };
  }

  return {
    async publishPost(input: PublishPostInput): Promise<PublishPostResult> {
      const postPayload = buildGhostPostPayload(input.article, config.defaultStatus);
      const remoteId = input.remoteId?.trim();

      if (remoteId) {
        const result = await ghostRequest(
          "PUT",
          `/ghost/api/admin/posts/${encodeURIComponent(remoteId)}/?source=html`,
          "update",
          { posts: [postPayload] },
          remoteId,
        );

        if (!result.ok) {
          return result;
        }

        const body = parseJsonBody<GhostPostsResponse>(result.bodyText);
        const post = body?.posts?.[0];
        const id = post?.id ?? remoteId;

        return {
          ok: true,
          created: false,
          path: post?.slug ?? input.article.slug,
          sha: id,
          commitSha: id,
          remoteId: id,
        };
      }

      const result = await ghostRequest(
        "POST",
        "/ghost/api/admin/posts/?source=html",
        "create",
        { posts: [postPayload] },
      );

      if (!result.ok) {
        return result;
      }

      const parsed = parsePostResponse(result.bodyText, input.article.slug);
      if (!parsed.ok) {
        return parsed;
      }

      return { ...parsed, created: true };
    },
  };
}
