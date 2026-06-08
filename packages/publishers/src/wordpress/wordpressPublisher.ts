import { resolveCmsStatus } from "../cmsPayload.js";
import {
  type HttpFetcher,
  parseJsonBody,
  readResponseBody,
  resolveFetcher,
} from "../http.js";
import type { CmsArticlePayload } from "../types.js";
import { formatWordPressApiError, type WordPressOperation } from "./wordpressErrors.js";

export type WordPressPublisherConfig = {
  apiUrl: string;
  username: string;
  appPassword: string;
  defaultStatus: string;
  defaultAuthor?: number;
  categoryIds?: Record<string, number>;
  tagIds?: Record<string, number>;
  fetch?: HttpFetcher;
};

type WordPressPostBody = {
  id?: number;
  slug?: string;
  link?: string;
  status?: string;
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

export type WordPressPublisher = {
  publishPost: (input: PublishPostInput) => Promise<PublishPostResult>;
};

function trimApiUrl(apiUrl: string): string {
  return apiUrl.replace(/\/+$/, "");
}

function basicAuthHeader(username: string, appPassword: string): string {
  const credentials = Buffer.from(`${username}:${appPassword}`).toString("base64");
  return `Basic ${credentials}`;
}

function resolveTaxonomyIds(
  names: string[],
  map: Record<string, number> | undefined,
): number[] {
  if (!map) {
    return [];
  }

  const ids: number[] = [];
  for (const name of names) {
    const id = map[name];
    if (typeof id === "number" && id > 0) {
      ids.push(id);
    }
  }

  return ids;
}

function wordpressErrorMessage(body: unknown, fallback: string): string {
  if (typeof body === "object" && body !== null) {
    const record = body as { message?: string; code?: string };
    if (record.message && record.message.trim().length > 0) {
      return record.message.trim();
    }
  }

  return fallback;
}

export function createWordPressPublisher(config: WordPressPublisherConfig): WordPressPublisher {
  const fetchImpl = resolveFetcher(config.fetch);
  const apiBase = trimApiUrl(config.apiUrl);

  async function wpRequest(
    method: string,
    path: string,
    operation: WordPressOperation,
    body?: Record<string, unknown>,
    postId?: string,
  ): Promise<
    | { ok: true; bodyText: string }
    | PublishPostError
  > {
    const response = await fetchImpl(`${apiBase}${path}`, {
      method,
      headers: {
        Authorization: basicAuthHeader(config.username, config.appPassword),
        Accept: "application/json",
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const bodyText = await readResponseBody(response);

    if (!response.ok) {
      const parsed = parseJsonBody<unknown>(bodyText);
      return {
        ok: false,
        error: formatWordPressApiError(
          response.status,
          wordpressErrorMessage(parsed, bodyText),
          operation,
          {
            apiUrl: apiBase,
            ...(postId !== undefined ? { postId } : {}),
          },
        ),
        status: response.status,
      };
    }

    return { ok: true, bodyText };
  }

  function buildPayload(article: CmsArticlePayload): Record<string, unknown> {
    const status = resolveCmsStatus(article.draft, config.defaultStatus);
    const categories = resolveTaxonomyIds([article.category], config.categoryIds);
    const tags = resolveTaxonomyIds(article.tags, config.tagIds);

    const payload: Record<string, unknown> = {
      title: article.title,
      content: article.body,
      slug: article.slug,
      status,
      excerpt: article.description,
      date: article.pubDate,
    };

    if (categories.length > 0) {
      payload.categories = categories;
    }

    if (tags.length > 0) {
      payload.tags = tags;
    }

    if (config.defaultAuthor !== undefined) {
      payload.author = config.defaultAuthor;
    }

    return payload;
  }

  return {
    async publishPost(input: PublishPostInput): Promise<PublishPostResult> {
      const payload = buildPayload(input.article);
      const remoteId = input.remoteId?.trim();

      if (remoteId) {
        const result = await wpRequest(
          "POST",
          `/wp/v2/posts/${encodeURIComponent(remoteId)}`,
          "update",
          payload,
          remoteId,
        );

        if (!result.ok) {
          return result;
        }

        const body = parseJsonBody<WordPressPostBody>(result.bodyText);
        const id = String(body?.id ?? remoteId);

        return {
          ok: true,
          created: false,
          path: body?.slug ?? input.article.slug,
          sha: id,
          commitSha: id,
          remoteId: id,
        };
      }

      const result = await wpRequest("POST", "/wp/v2/posts", "create", payload);

      if (!result.ok) {
        return result;
      }

      const body = parseJsonBody<WordPressPostBody>(result.bodyText);
      const id = String(body?.id ?? "");

      if (id.length === 0) {
        return {
          ok: false,
          error: "WordPress created a post but did not return an id.",
        };
      }

      return {
        ok: true,
        created: true,
        path: body?.slug ?? input.article.slug,
        sha: id,
        commitSha: id,
        remoteId: id,
      };
    },
  };
}
