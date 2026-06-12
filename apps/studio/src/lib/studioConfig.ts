import type { PublishMode } from "@sourcedraft/publishers";
import { DEFAULT_STUDIO_CATEGORIES } from "./defaultCategories.js";

export type StudioConfig = {
  adapter: string;
  contentDir: string;
  mediaDir: string;
  publicMediaPath: string;
  defaultBranch: string;
  categories: string[];
  adapterOptions?: Record<string, unknown>;
  githubOwner: string;
  githubRepo: string;
  publisher: string;
  publishMode: PublishMode;
  prBranchPrefix: string;
  prDraft: boolean;
  demoMode?: boolean;
};

export const FALLBACK_STUDIO_CONFIG: StudioConfig = {
  adapter: "astro-mdx",
  contentDir: "src/content/blog",
  mediaDir: "src/assets/images",
  publicMediaPath: "/images",
  defaultBranch: "main",
  categories: [...DEFAULT_STUDIO_CATEGORIES],
  githubOwner: "",
  githubRepo: "",
  publisher: "github",
  publishMode: "direct",
  prBranchPrefix: "sourcedraft/",
  prDraft: false,
};

export async function fetchStudioConfig(): Promise<StudioConfig> {
  try {
    const response = await fetch("/api/config", { credentials: "include" });
    if (!response.ok) {
      return FALLBACK_STUDIO_CONFIG;
    }

    const data = (await response.json()) as StudioConfig;
    return {
      adapter: data.adapter || FALLBACK_STUDIO_CONFIG.adapter,
      contentDir: data.contentDir || FALLBACK_STUDIO_CONFIG.contentDir,
      mediaDir: data.mediaDir || FALLBACK_STUDIO_CONFIG.mediaDir,
      publicMediaPath:
        data.publicMediaPath || FALLBACK_STUDIO_CONFIG.publicMediaPath,
      defaultBranch: data.defaultBranch || FALLBACK_STUDIO_CONFIG.defaultBranch,
      categories:
        data.categories?.length > 0
          ? data.categories
          : FALLBACK_STUDIO_CONFIG.categories,
      ...(data.adapterOptions !== undefined
        ? { adapterOptions: data.adapterOptions }
        : {}),
      githubOwner: data.githubOwner || "",
      githubRepo: data.githubRepo || "",
      publisher: data.publisher || FALLBACK_STUDIO_CONFIG.publisher,
      publishMode: data.publishMode || FALLBACK_STUDIO_CONFIG.publishMode,
      prBranchPrefix:
        data.prBranchPrefix || FALLBACK_STUDIO_CONFIG.prBranchPrefix,
      prDraft: data.prDraft === true,
      demoMode: data.demoMode === true,
    };
  } catch {
    return FALLBACK_STUDIO_CONFIG;
  }
}
