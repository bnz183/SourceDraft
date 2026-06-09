import {
  derivePublicMediaPath,
  loadSourceDraftConfig,
  normalizePublicMediaPath,
} from "@sourcedraft/config";
import type { SourceDraftConfig } from "@sourcedraft/config";
import {
  isAdapterId,
  listAdapterIds,
  supportedAdapterSummary,
  type AdapterId,
} from "@sourcedraft/adapters";
import {
  isPublisherId,
  listPublisherIds,
  supportedPublisherSummary,
  type PublisherId,
} from "@sourcedraft/publishers";

export type SupportedAdapter = AdapterId;
export type SupportedPublisher = PublisherId;

export type PublishEnvConfig = {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  contentDir: string;
  mediaDir: string;
  publicMediaPath: string;
  adapter: SupportedAdapter;
  publisher: SupportedPublisher;
  adapterOptions?: Record<string, unknown>;
  publisherOptions?: Record<string, unknown>;
  categories: string[];
};

export type PublishEnvResult =
  | { ok: true; config: PublishEnvConfig }
  | { ok: false; error: string };

export function loadProjectConfig(): SourceDraftConfig {
  return loadSourceDraftConfig();
}

function resolveAdapter(rawAdapter: string): SupportedAdapter | null {
  if (isAdapterId(rawAdapter)) {
    return rawAdapter;
  }

  return null;
}

function resolvePublisher(rawPublisher: string): SupportedPublisher | null {
  if (isPublisherId(rawPublisher)) {
    return rawPublisher;
  }

  return null;
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
  const rawPublisher = process.env.CMS_PUBLISHER?.trim() || project.publisher;
  const adapter = resolveAdapter(rawAdapter);
  const publisher = resolvePublisher(rawPublisher);

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
      error: `Unsupported adapter "${rawAdapter}". Supported adapters: ${supportedAdapterSummary()}.`,
    };
  }

  if (publisher === null) {
    return {
      ok: false,
      error: `Unsupported publisher "${rawPublisher}". Supported publishers: ${supportedPublisherSummary()}.`,
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
      publisher,
      ...(project.adapterOptions !== undefined
        ? { adapterOptions: project.adapterOptions }
        : {}),
      ...(project.publisherOptions !== undefined
        ? { publisherOptions: project.publisherOptions }
        : {}),
      categories: project.categories,
    },
  };
}

export type PublicStudioConfig = Omit<PublishEnvConfig, "token">;

export function loadPublicConfig(): PublicStudioConfig {
  const project = loadProjectConfig();
  const rawAdapter = process.env.CMS_ADAPTER?.trim() || project.adapter;
  const rawPublisher = process.env.CMS_PUBLISHER?.trim() || project.publisher;
  const adapter = resolveAdapter(rawAdapter) ?? "astro-mdx";
  const publisher = resolvePublisher(rawPublisher) ?? "github";
  const mediaDir = process.env.CMS_MEDIA_DIR?.trim() || project.mediaDir;

  return {
    owner: process.env.GITHUB_OWNER?.trim() || "",
    repo: process.env.GITHUB_REPO?.trim() || "",
    branch: process.env.GITHUB_BRANCH?.trim() || project.defaultBranch,
    contentDir: process.env.CMS_CONTENT_DIR?.trim() || project.contentDir,
    mediaDir,
    publicMediaPath: resolvePublicMediaPath(mediaDir, project),
    adapter,
    publisher,
    ...(project.adapterOptions !== undefined
      ? { adapterOptions: project.adapterOptions }
      : {}),
    ...(project.publisherOptions !== undefined
      ? { publisherOptions: project.publisherOptions }
      : {}),
    categories: project.categories,
  };
}

export function listSupportedAdapters(): SupportedAdapter[] {
  return listAdapterIds();
}

export function listSupportedPublishers(): SupportedPublisher[] {
  return listPublisherIds();
}
