import { derivePublicMediaPath } from "./publicMediaPath.js";

export type SourceDraftConfig = {
  adapter: string;
  publisher: string;
  contentDir: string;
  mediaDir: string;
  publicMediaPath: string;
  /** Set when sourcedraft.config.json includes publicMediaPath */
  publicMediaPathExplicit?: string;
  defaultBranch: string;
  categories: string[];
  adapterOptions?: Record<string, unknown>;
  publisherOptions?: Record<string, unknown>;
};

export const DEFAULT_SOURCEDRAFT_CONFIG: SourceDraftConfig = {
  adapter: "astro-mdx",
  publisher: "github",
  contentDir: "src/content/blog",
  mediaDir: "src/assets/images",
  publicMediaPath: derivePublicMediaPath("src/assets/images"),
  defaultBranch: "main",
  categories: ["Guides", "Notes", "Reviews", "Tutorials", "Reference"],
};
