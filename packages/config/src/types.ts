export type SourceDraftConfig = {
  adapter: string;
  contentDir: string;
  mediaDir: string;
  defaultBranch: string;
  categories: string[];
};

export const DEFAULT_SOURCEDRAFT_CONFIG: SourceDraftConfig = {
  adapter: "astro-mdx",
  contentDir: "src/content/blog",
  mediaDir: "src/assets/images",
  defaultBranch: "main",
  categories: ["Guides", "Notes", "Reviews", "Tutorials", "Reference"],
};
