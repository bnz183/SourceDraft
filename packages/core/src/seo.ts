import type { Article, ArticleInput } from "./article.js";

export const META_TITLE_LENGTH_GUIDANCE = 60;
export const META_DESCRIPTION_LENGTH_GUIDANCE = 160;
export const WORDS_PER_MINUTE = 200;

export function computeReadingTimeMinutes(body: string): number {
  const trimmed = body.trim();
  if (trimmed.length === 0) {
    return 0;
  }

  const wordCount = trimmed.split(/\s+/u).length;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

export function resolveMetaTitle(
  article: Pick<Article, "title" | "metaTitle">,
): string {
  const meta = article.metaTitle?.trim();
  if (meta && meta.length > 0) {
    return meta;
  }

  return article.title.trim();
}

export function resolveMetaDescription(
  article: Pick<Article, "description" | "metaDescription">,
): string {
  const meta = article.metaDescription?.trim();
  if (meta && meta.length > 0) {
    return meta;
  }

  return article.description.trim();
}

export function resolveSocialImage(
  article: Pick<Article, "heroImage" | "socialImage">,
): string | undefined {
  const social = article.socialImage?.trim();
  if (social && social.length > 0) {
    return social;
  }

  const cover = article.heroImage?.trim();
  return cover && cover.length > 0 ? cover : undefined;
}

export function isValidCanonicalUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export type SeoWarning = {
  id: string;
  field: string;
  message: string;
};

export function buildSeoWarnings(input: ArticleInput): SeoWarning[] {
  const warnings: SeoWarning[] = [];

  const metaTitle =
    typeof input.metaTitle === "string" ? input.metaTitle.trim() : "";
  if (metaTitle.length > META_TITLE_LENGTH_GUIDANCE) {
    warnings.push({
      id: "meta-title-long",
      field: "metaTitle",
      message: `Meta title is ${metaTitle.length} characters. Many search results show about ${META_TITLE_LENGTH_GUIDANCE} characters.`,
    });
  }

  const metaDescription =
    typeof input.metaDescription === "string" ? input.metaDescription.trim() : "";
  if (metaDescription.length > META_DESCRIPTION_LENGTH_GUIDANCE) {
    warnings.push({
      id: "meta-description-long",
      field: "metaDescription",
      message: `Meta description is ${metaDescription.length} characters. Snippets are often shorter than ${META_DESCRIPTION_LENGTH_GUIDANCE} characters.`,
    });
  }

  const heroImage =
    typeof input.heroImage === "string" ? input.heroImage.trim() : "";
  const coverImageAlt =
    typeof input.coverImageAlt === "string" ? input.coverImageAlt.trim() : "";
  if (heroImage.length > 0 && coverImageAlt.length === 0) {
    warnings.push({
      id: "cover-alt-missing",
      field: "coverImageAlt",
      message: "Cover image is set but alt text is empty.",
    });
  }

  return warnings;
}
