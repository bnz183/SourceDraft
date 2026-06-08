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
  };
}
