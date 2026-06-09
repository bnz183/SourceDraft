import { derivePublicMediaPath } from "./publicMediaPath.js";

export type SourceDraftConfig = {
  adapter: string;
  contentDir: string;
  mediaDir: string;
  publicMediaPath: string;
  /** Set when sourcedraft.config.json includes publicMediaPath */
  publicMediaPathExplicit?: string;
  defaultBranch: string;
  categories: string[];
};

export const DEFAULT_SOURCEDRAFT_CONFIG: SourceDraftConfig = {
  adapter: "astro-mdx",
  contentDir: "src/content/blog",
  mediaDir: "src/assets/images",
  publicMediaPath: derivePublicMediaPath("src/assets/images"),
  defaultBranch: "main",
  categories: ["Guides", "Notes", "Reviews", "Tutorials", "Reference"],
};
