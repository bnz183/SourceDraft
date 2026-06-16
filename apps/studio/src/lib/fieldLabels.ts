const FIELD_LABELS: Record<string, string> = {
  title: "Title",
  description: "Description",
  slug: "URL slug",
  category: "Category",
  tags: "Tags",
  pubDate: "Publication date",
  updatedDate: "Updated date",
  heroImage: "Cover image",
  body: "Article body",
  metaTitle: "SEO title",
  metaDescription: "SEO description",
  socialImage: "Social image",
  coverImageAlt: "Cover image description",
  draft: "Draft status",
};

export function fieldLabel(field: string): string {
  return FIELD_LABELS[field] ?? field;
}
