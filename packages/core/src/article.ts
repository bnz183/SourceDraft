export type ArticleInput = {
  title?: unknown;
  slug?: unknown;
  description?: unknown;
  pubDate?: unknown;
  updatedDate?: unknown;
  category?: unknown;
  tags?: unknown;
  draft?: unknown;
  heroImage?: unknown;
  body?: unknown;
};

export type Article = {
  title: string;
  slug: string;
  description: string;
  pubDate: string;
  category: string;
  tags: string[];
  draft: boolean;
  body: string;
  updatedDate?: string;
  heroImage?: string;
};

export type ValidationIssue = {
  field: string;
  message: string;
};

export type ValidationResult = {
  valid: boolean;
  issues: ValidationIssue[];
};
