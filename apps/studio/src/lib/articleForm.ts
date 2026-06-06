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

export const CATEGORY_OPTIONS = [
  "Guides",
  "Notes",
  "Reviews",
  "Tutorials",
  "Reference",
] as const;

export function createInitialFormState(): ArticleFormState {
  return {
    title: "",
    slug: "",
    description: "",
    pubDate: new Date().toISOString().slice(0, 10),
    updatedDate: "",
    category: CATEGORY_OPTIONS[0],
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
