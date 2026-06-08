import type { CmsArticlePayload } from "./types.js";

export function resolveCmsStatus(
  draft: boolean,
  defaultStatus: string,
): string {
  if (draft) {
    return "draft";
  }

  return defaultStatus;
}

export function resolveFeatureImageUrl(article: CmsArticlePayload): string | undefined {
  const candidate = article.socialImage ?? article.heroImage;
  if (!candidate) {
    return undefined;
  }

  if (/^https?:\/\//i.test(candidate)) {
    return candidate;
  }

  return undefined;
}

export function requireCmsArticle(
  input: { article?: CmsArticlePayload },
  publisherId: string,
): CmsArticlePayload | { ok: false; error: string } {
  if (!input.article) {
    return {
      ok: false,
      error: `Publisher "${publisherId}" requires article fields but none were provided.`,
    };
  }

  return input.article;
}
