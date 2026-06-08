import {
  derivePublicMediaPath,
  loadSourceDraftConfig,
  normalizePublicMediaPath,
} from "@sourcedraft/config";
import type { SourceDraftConfig } from "@sourcedraft/config";

export type SupportedAdapter = "astro-mdx" | "markdown";

export type PublishEnvConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  contentDir: string;
  mediaDir: string;
  publicMediaPath: string;
  adapter: SupportedAdapter;
  categories: string[];
};

export type PublishEnvResult =
  | { ok: true; config: PublishEnvConfig }
  | { ok: false; error: string };

const SUPPORTED_ADAPTERS = new Set<string>(["astro-mdx", "markdown"]);

function resolveAdapter(rawAdapter: string): SupportedAdapter | null {
  if (SUPPORTED_ADAPTERS.has(rawAdapter)) {
    return rawAdapter as SupportedAdapter;
  }

  return null;
}

export function loadProjectConfig(): SourceDraftConfig {
  return loadSourceDraftConfig();
}

function resolvePublicMediaPath(
  mediaDir: string,
  project: SourceDraftConfig,
): string {
  const envOverride = process.env.CMS_PUBLIC_MEDIA_PATH?.trim();
  if (envOverride) {
    return normalizePublicMediaPath(envOverride);
  }

  if (project.publicMediaPathExplicit !== undefined) {
    return project.publicMediaPathExplicit;
  }

  return derivePublicMediaPath(mediaDir);
}

export function loadPublishEnv(): PublishEnvResult {
  const project = loadProjectConfig();

  const token = process.env.GITHUB_TOKEN?.trim();
  const owner = process.env.GITHUB_OWNER?.trim();
  const repo = process.env.GITHUB_REPO?.trim();
  const branch =
    process.env.GITHUB_BRANCH?.trim() || project.defaultBranch;
  const contentDir =
    process.env.CMS_CONTENT_DIR?.trim() || project.contentDir;
  const mediaDir = process.env.CMS_MEDIA_DIR?.trim() || project.mediaDir;
  const publicMediaPath = resolvePublicMediaPath(mediaDir, project);
  const rawAdapter = process.env.CMS_ADAPTER?.trim() || project.adapter;
  const adapter = resolveAdapter(rawAdapter);

  if (!token) {
    return { ok: false, error: "GITHUB_TOKEN is not configured." };
  }

  if (!owner) {
    return { ok: false, error: "GITHUB_OWNER is not configured." };
  }

  if (!repo) {
    return { ok: false, error: "GITHUB_REPO is not configured." };
  }

  if (adapter === null) {
    return {
      ok: false,
      error: `Unsupported adapter "${rawAdapter}". Supported adapters: astro-mdx, markdown.`,
    };
  }

  return {
    ok: true,
    config: {
      token,
      owner,
      repo,
      branch,
      contentDir,
      mediaDir,
      publicMediaPath,
      adapter,
      categories: project.categories,
    },
  };
}

export function loadPublicConfig(): Omit<PublishEnvConfig, "token"> {
  const project = loadProjectConfig();
  const rawAdapter = process.env.CMS_ADAPTER?.trim() || project.adapter;
  const adapter = resolveAdapter(rawAdapter) ?? "astro-mdx";
  const mediaDir = process.env.CMS_MEDIA_DIR?.trim() || project.mediaDir;

  return {
    owner: process.env.GITHUB_OWNER?.trim() || "",
    repo: process.env.GITHUB_REPO?.trim() || "",
    branch: process.env.GITHUB_BRANCH?.trim() || project.defaultBranch,
    contentDir: process.env.CMS_CONTENT_DIR?.trim() || project.contentDir,
    mediaDir,
    publicMediaPath: resolvePublicMediaPath(mediaDir, project),
    adapter,
    categories: project.categories,
  };
}
