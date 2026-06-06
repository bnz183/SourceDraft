import { loadSourceDraftConfig } from "@sourcedraft/config";
import type { SourceDraftConfig } from "@sourcedraft/config";

export type PublishEnvConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  contentDir: string;
  mediaDir: string;
  adapter: string;
  categories: string[];
};

export type PublishEnvResult =
  | { ok: true; config: PublishEnvConfig }
  | { ok: false; error: string };

export function loadProjectConfig(): SourceDraftConfig {
  return loadSourceDraftConfig();
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
  const adapter = process.env.CMS_ADAPTER?.trim() || project.adapter;

  if (!token) {
    return { ok: false, error: "GITHUB_TOKEN is not configured." };
  }

  if (!owner) {
    return { ok: false, error: "GITHUB_OWNER is not configured." };
  }

  if (!repo) {
    return { ok: false, error: "GITHUB_REPO is not configured." };
  }

  if (adapter !== "astro-mdx") {
    return {
      ok: false,
      error: `Unsupported adapter "${adapter}". Only astro-mdx is supported.`,
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
      adapter,
      categories: project.categories,
    },
  };
}

export function loadPublicConfig(): Omit<PublishEnvConfig, "token"> {
  const project = loadProjectConfig();

  return {
    owner: process.env.GITHUB_OWNER?.trim() || "",
    repo: process.env.GITHUB_REPO?.trim() || "",
    branch: process.env.GITHUB_BRANCH?.trim() || project.defaultBranch,
    contentDir: process.env.CMS_CONTENT_DIR?.trim() || project.contentDir,
    mediaDir: process.env.CMS_MEDIA_DIR?.trim() || project.mediaDir,
    adapter: process.env.CMS_ADAPTER?.trim() || project.adapter,
    categories: project.categories,
  };
}
