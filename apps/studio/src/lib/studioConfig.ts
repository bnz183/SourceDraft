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
  demoMode?: boolean;
};

export const FALLBACK_STUDIO_CONFIG: StudioConfig = {
  adapter: "astro-mdx",
  contentDir: "src/content/blog",
  mediaDir: "src/assets/images",
  publicMediaPath: "/images",
  defaultBranch: "main",
  categories: ["Guides", "Notes", "Reviews", "Tutorials", "Reference"],
  githubOwner: "",
  githubRepo: "",
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
      demoMode: data.demoMode === true,
    };
  } catch {
    return FALLBACK_STUDIO_CONFIG;
  }
}
