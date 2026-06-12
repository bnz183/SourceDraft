import { readFileSync } from "node:fs";
import { join } from "node:path";
import { splitFrontmatter } from "./frontmatter.js";
import { listSampleMarkdownFiles } from "./scanUtils.js";

export type FrontmatterFieldHint = {
  key: string;
  frequency: number;
  universalField?: string;
};

export type InferredFrontmatterSchema = {
  postsSampled: number;
  fields: FrontmatterFieldHint[];
  suggestedCategories: string[];
};

const UNIVERSAL_FIELD_ALIASES: Record<string, string> = {
  title: "title",
  slug: "slug",
  description: "description",
  summary: "description",
  excerpt: "description",
  pubdate: "pubDate",
  pubDate: "pubDate",
  date: "pubDate",
  published: "pubDate",
  publishdate: "pubDate",
  updateddate: "updatedDate",
  updatedDate: "updatedDate",
  lastmod: "updatedDate",
  modified: "updatedDate",
  category: "category",
  categories: "category",
  tags: "tags",
  draft: "draft",
  heroimage: "heroImage",
  heroImage: "heroImage",
  image: "heroImage",
  cover: "heroImage",
  coverimage: "heroImage",
  coverImage: "heroImage",
  author: "author",
  metatitle: "metaTitle",
  metaTitle: "metaTitle",
  metadescription: "metaDescription",
  metaDescription: "metaDescription",
};

function readPostContent(root: string, relativePath: string): string | null {
  try {
    return readFileSync(join(root, relativePath), "utf8");
  } catch {
    return null;
  }
}

function normalizeCategoryValue(value: unknown): string[] {
  if (typeof value === "string" && value.trim().length > 0) {
    return [value.trim()];
  }

  if (Array.isArray(value)) {
    return value
      .filter((entry): entry is string => typeof entry === "string")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
  }

  return [];
}

export function inferFrontmatterSchema(
  root: string,
  contentDir: string,
  maxSamples = 5,
): InferredFrontmatterSchema | null {
  const samplePaths = listSampleMarkdownFiles(root, contentDir, maxSamples);
  if (samplePaths.length === 0) {
    return null;
  }

  const fieldCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  let postsSampled = 0;

  for (const relativePath of samplePaths) {
    const content = readPostContent(root, relativePath);
    if (content === null) {
      continue;
    }

    const parsed = splitFrontmatter(content);
    if (parsed === null) {
      continue;
    }

    postsSampled += 1;
    for (const key of Object.keys(parsed.frontmatter)) {
      fieldCounts.set(key, (fieldCounts.get(key) ?? 0) + 1);
    }

    const categoryValue =
      parsed.frontmatter.category ?? parsed.frontmatter.categories;
    for (const category of normalizeCategoryValue(categoryValue)) {
      categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
    }
  }

  if (postsSampled === 0) {
    return null;
  }

  const fields: FrontmatterFieldHint[] = [...fieldCounts.entries()]
    .map(([key, frequency]) => {
      const universalField =
        UNIVERSAL_FIELD_ALIASES[key] ?? UNIVERSAL_FIELD_ALIASES[key.toLowerCase()];
      const hint: FrontmatterFieldHint = { key, frequency };
      if (universalField !== undefined) {
        hint.universalField = universalField;
      }
      return hint;
    })
    .sort((left, right) => right.frequency - left.frequency);

  const suggestedCategories = [...categoryCounts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([category]) => category)
    .slice(0, 12);

  return {
    postsSampled,
    fields,
    suggestedCategories,
  };
}
