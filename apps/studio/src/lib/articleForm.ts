import type { ArticleInput } from "@sourcedraft/core";
import { createSlug } from "@sourcedraft/core";

export type ArticleFormState = {
  title: string;
  slug: string;
  description: string;
  pubDate: string;
  updatedDate: string;
  category: string;
  tags: string;
  draft: boolean;
  heroImage: string;
  body: string;
  author: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  socialImage: string;
  coverImageAlt: string;
  noindex: boolean;
};

export function createInitialFormState(
  defaultCategory = "Guides",
): ArticleFormState {
  return {
    title: "",
    slug: "",
    description: "",
    pubDate: new Date().toISOString().slice(0, 10),
    updatedDate: "",
    category: defaultCategory,
    tags: "",
    draft: true,
    heroImage: "",
    body: "",
    author: "",
    metaTitle: "",
    metaDescription: "",
    canonicalUrl: "",
    socialImage: "",
    coverImageAlt: "",
    noindex: false,
  };
}

export function parseTagsInput(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export function formStateToArticleInput(state: ArticleFormState): ArticleInput {
  const input: ArticleInput = {
    title: state.title,
    slug: state.slug,
    description: state.description,
    pubDate: state.pubDate,
    category: state.category,
    tags: parseTagsInput(state.tags),
    draft: state.draft,
    body: state.body,
  };

  if (state.updatedDate.trim().length > 0) {
    input.updatedDate = state.updatedDate;
  }

  if (state.heroImage.trim().length > 0) {
    input.heroImage = state.heroImage;
  }

  if (state.author.trim().length > 0) {
    input.author = state.author;
  }

  if (state.metaTitle.trim().length > 0) {
    input.metaTitle = state.metaTitle;
  }

  if (state.metaDescription.trim().length > 0) {
    input.metaDescription = state.metaDescription;
  }

  if (state.canonicalUrl.trim().length > 0) {
    input.canonicalUrl = state.canonicalUrl;
  }

  if (state.socialImage.trim().length > 0) {
    input.socialImage = state.socialImage;
  }

  if (state.coverImageAlt.trim().length > 0) {
    input.coverImageAlt = state.coverImageAlt;
  }

  if (state.noindex) {
    input.noindex = true;
  }

  return input;
}

export function slugFromTitle(title: string): string {
  return createSlug(title);
}

function tagsToInput(value: unknown): string {
  if (!Array.isArray(value)) {
    return "";
  }

  return value
    .filter((tag): tag is string => typeof tag === "string")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
    .join(", ");
}

function stringField(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function dateField(value: unknown): string {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim().slice(0, 10);
  }

  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  return "";
}

export function articleInputToFormState(
  input: ArticleInput,
  defaultCategory = "Guides",
): ArticleFormState {
  const pubDate = dateField(input.pubDate);

  return {
    title: stringField(input.title),
    slug: stringField(input.slug),
    description: stringField(input.description),
    pubDate: pubDate.length > 0 ? pubDate : new Date().toISOString().slice(0, 10),
    updatedDate: dateField(input.updatedDate),
    category: stringField(input.category, defaultCategory),
    tags: tagsToInput(input.tags),
    draft: typeof input.draft === "boolean" ? input.draft : true,
    heroImage: stringField(input.heroImage),
    body: stringField(input.body),
    author: stringField(input.author),
    metaTitle: stringField(input.metaTitle),
    metaDescription: stringField(input.metaDescription),
    canonicalUrl: stringField(input.canonicalUrl),
    socialImage: stringField(input.socialImage),
    coverImageAlt: stringField(input.coverImageAlt),
    noindex: input.noindex === true,
  };
}
