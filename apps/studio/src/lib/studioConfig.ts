export type StudioConfig = {
  adapter: string;
  contentDir: string;
  mediaDir: string;
  defaultBranch: string;
  categories: string[];
  githubOwner: string;
  githubRepo: string;
};

export const FALLBACK_STUDIO_CONFIG: StudioConfig = {
  adapter: "astro-mdx",
  contentDir: "src/content/blog",
  mediaDir: "src/assets/images",
  defaultBranch: "main",
  categories: ["Guides", "Notes", "Reviews", "Tutorials", "Reference"],
  githubOwner: "",
  githubRepo: "",
};

export async function fetchStudioConfig(): Promise<StudioConfig> {
  try {
    const response = await fetch("/api/config");
    if (!response.ok) {
      return FALLBACK_STUDIO_CONFIG;
    }

    const data = (await response.json()) as StudioConfig;
    return {
      adapter: data.adapter || FALLBACK_STUDIO_CONFIG.adapter,
      contentDir: data.contentDir || FALLBACK_STUDIO_CONFIG.contentDir,
      mediaDir: data.mediaDir || FALLBACK_STUDIO_CONFIG.mediaDir,
      defaultBranch: data.defaultBranch || FALLBACK_STUDIO_CONFIG.defaultBranch,
      categories:
        data.categories?.length > 0
          ? data.categories
          : FALLBACK_STUDIO_CONFIG.categories,
      githubOwner: data.githubOwner || "",
      githubRepo: data.githubRepo || "",
    };
  } catch {
    return FALLBACK_STUDIO_CONFIG;
  }
}
