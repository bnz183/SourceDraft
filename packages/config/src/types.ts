import { DEFAULT_SOURCEDRAFT_CATEGORIES } from "./defaultCategories.js";
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
  /** Server-side plugin entry paths, relative to sourcedraft.config.json */
  plugins?: string[];
  /** Plugin manifest names that must load successfully or startup fails */
  requiredPlugins?: string[];
  /** When true, also load *.js/*.mjs/*.cjs from ./plugins next to config */
  discoverPlugins?: boolean;
};

export const DEFAULT_SOURCEDRAFT_CONFIG: SourceDraftConfig = {
  adapter: "astro-mdx",
  publisher: "github",
  contentDir: "src/content/blog",
  mediaDir: "src/assets/images",
  publicMediaPath: derivePublicMediaPath("src/assets/images"),
  defaultBranch: "main",
  categories: [...DEFAULT_SOURCEDRAFT_CATEGORIES],
};
