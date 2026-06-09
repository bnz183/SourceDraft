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
  parsePublishMode,
  supportedPublisherSummary,
  type PublisherId,
  type PublishMode,
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
  publishMode: PublishMode;
  prBranchPrefix: string;
  prDraft: boolean;
  adapterOptions?: Record<string, unknown>;
  publisherOptions?: Record<string, unknown>;
  categories: string[];
  gitlabProjectRef?: string;
  gitlabBaseUrl?: string;
  bitbucketUsername?: string;
  wordpressApiUrl?: string;
  wordpressUsername?: string;
  wordpressAppPassword?: string;
  wordpressDefaultStatus?: string;
  wordpressDefaultAuthor?: number;
  ghostAdminUrl?: string;
  ghostAdminApiKey?: string;
  ghostAcceptVersion?: string;
  ghostDefaultStatus?: string;
};

export type PublishEnvResult =
  | { ok: true; config: PublishEnvConfig }
  | { ok: false; error: string };

export function loadProjectConfig(): SourceDraftConfig {
  return loadSourceDraftConfig();
}

function parseBooleanEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes") {
    return true;
  }

  if (normalized === "false" || normalized === "0" || normalized === "no") {
    return false;
  }

  return defaultValue;
}

function resolvePublishModeFromEnv(): PublishMode {
  const raw = process.env.SOURCEDRAFT_PUBLISH_MODE?.trim().toLowerCase();
  const parsed = parsePublishMode(raw);
  let mode: PublishMode = parsed ?? "direct";

  if (mode === "pull-request" && parseBooleanEnv(process.env.SOURCEDRAFT_PR_DRAFT, false)) {
    mode = "draft-pull-request";
  }

  return mode;
}

function resolvePrBranchPrefix(): string {
  const raw = process.env.SOURCEDRAFT_PR_BRANCH_PREFIX?.trim();
  if (!raw) {
    return "sourcedraft/";
  }

  return raw.endsWith("/") ? raw : `${raw}/`;
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

type PublisherCredentialsResult =
  | {
      ok: true;
      token: string;
      owner: string;
      repo: string;
      branch: string;
      gitlabProjectRef?: string;
      gitlabBaseUrl?: string;
      bitbucketUsername?: string;
      wordpressApiUrl?: string;
      wordpressUsername?: string;
      wordpressAppPassword?: string;
      wordpressDefaultStatus?: string;
      wordpressDefaultAuthor?: number;
      ghostAdminUrl?: string;
      ghostAdminApiKey?: string;
      ghostAcceptVersion?: string;
      ghostDefaultStatus?: string;
    }
  | { ok: false; error: string };

function parseOptionalAuthorId(raw: string | undefined): number | undefined {
  if (!raw) {
    return undefined;
  }

  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function resolvePublisherCredentials(
  publisher: SupportedPublisher,
  defaultBranch: string,
): PublisherCredentialsResult {
  if (publisher === "gitlab") {
    const token = process.env.GITLAB_TOKEN?.trim();
    const projectId = process.env.GITLAB_PROJECT_ID?.trim();
    const projectPath = process.env.GITLAB_PROJECT_PATH?.trim();
    const gitlabProjectRef = projectId || projectPath;
    const branch = process.env.GITLAB_BRANCH?.trim() || defaultBranch;
    const gitlabBaseUrl =
      process.env.GITLAB_BASE_URL?.trim() || "https://gitlab.com";

    if (!token) {
      return { ok: false, error: "GITLAB_TOKEN is not configured." };
    }

    if (!gitlabProjectRef) {
      return {
        ok: false,
        error: "GITLAB_PROJECT_ID or GITLAB_PROJECT_PATH is not configured.",
      };
    }

    return {
      ok: true,
      token,
      owner: projectPath || projectId || "",
      repo: "",
      branch,
      gitlabProjectRef,
      gitlabBaseUrl,
    };
  }

  if (publisher === "wordpress") {
    const apiUrl = process.env.WORDPRESS_API_URL?.trim();
    const username = process.env.WORDPRESS_USERNAME?.trim();
    const appPassword = process.env.WORDPRESS_APP_PASSWORD?.trim();
    const defaultStatus =
      process.env.WORDPRESS_DEFAULT_STATUS?.trim() || "draft";
    const defaultAuthor = parseOptionalAuthorId(
      process.env.WORDPRESS_DEFAULT_AUTHOR?.trim(),
    );

    if (!apiUrl) {
      return { ok: false, error: "WORDPRESS_API_URL is not configured." };
    }

    if (!username) {
      return { ok: false, error: "WORDPRESS_USERNAME is not configured." };
    }

    if (!appPassword) {
      return {
        ok: false,
        error: "WORDPRESS_APP_PASSWORD is not configured.",
      };
    }

    return {
      ok: true,
      token: "",
      owner: "",
      repo: "",
      branch: defaultBranch,
      wordpressApiUrl: apiUrl,
      wordpressUsername: username,
      wordpressAppPassword: appPassword,
      wordpressDefaultStatus: defaultStatus,
      ...(defaultAuthor !== undefined ? { wordpressDefaultAuthor: defaultAuthor } : {}),
    };
  }

  if (publisher === "ghost") {
    const adminUrl = process.env.GHOST_ADMIN_URL?.trim();
    const adminApiKey = process.env.GHOST_ADMIN_API_KEY?.trim();
    const acceptVersion =
      process.env.GHOST_ACCEPT_VERSION?.trim() || "v5.126";
    const defaultStatus = process.env.GHOST_DEFAULT_STATUS?.trim() || "draft";

    if (!adminUrl) {
      return { ok: false, error: "GHOST_ADMIN_URL is not configured." };
    }

    if (!adminApiKey) {
      return { ok: false, error: "GHOST_ADMIN_API_KEY is not configured." };
    }

    return {
      ok: true,
      token: "",
      owner: "",
      repo: "",
      branch: defaultBranch,
      ghostAdminUrl: adminUrl,
      ghostAdminApiKey: adminApiKey,
      ghostAcceptVersion: acceptVersion,
      ghostDefaultStatus: defaultStatus,
    };
  }

  if (publisher === "bitbucket") {
    const token = process.env.BITBUCKET_TOKEN?.trim();
    const owner = process.env.BITBUCKET_WORKSPACE?.trim();
    const repo = process.env.BITBUCKET_REPO_SLUG?.trim();
    const branch = process.env.BITBUCKET_BRANCH?.trim() || defaultBranch;
    const bitbucketUsername = process.env.BITBUCKET_USERNAME?.trim();

    if (!token) {
      return { ok: false, error: "BITBUCKET_TOKEN is not configured." };
    }

    if (!owner) {
      return { ok: false, error: "BITBUCKET_WORKSPACE is not configured." };
    }

    if (!repo) {
      return { ok: false, error: "BITBUCKET_REPO_SLUG is not configured." };
    }

    return {
      ok: true,
      token,
      owner,
      repo,
      branch,
      ...(bitbucketUsername ? { bitbucketUsername } : {}),
    };
  }

  const token = process.env.GITHUB_TOKEN?.trim();
  const owner = process.env.GITHUB_OWNER?.trim();
  const repo = process.env.GITHUB_REPO?.trim();
  const branch = process.env.GITHUB_BRANCH?.trim() || defaultBranch;

  if (!token) {
    return { ok: false, error: "GITHUB_TOKEN is not configured." };
  }

  if (!owner) {
    return { ok: false, error: "GITHUB_OWNER is not configured." };
  }

  if (!repo) {
    return { ok: false, error: "GITHUB_REPO is not configured." };
  }

  return { ok: true, token, owner, repo, branch };
}

export function loadPublishEnv(): PublishEnvResult {
  const project = loadProjectConfig();

  const contentDir =
    process.env.CMS_CONTENT_DIR?.trim() || project.contentDir;
  const mediaDir = process.env.CMS_MEDIA_DIR?.trim() || project.mediaDir;
  const publicMediaPath = resolvePublicMediaPath(mediaDir, project);
  const rawAdapter = process.env.CMS_ADAPTER?.trim() || project.adapter;
  const rawPublisher = process.env.CMS_PUBLISHER?.trim() || project.publisher;
  const adapter = resolveAdapter(rawAdapter);
  const publisher = resolvePublisher(rawPublisher);

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

  const credentials = resolvePublisherCredentials(publisher, project.defaultBranch);
  if (!credentials.ok) {
    return credentials;
  }

  return {
    ok: true,
    config: {
      token: credentials.token,
      owner: credentials.owner,
      repo: credentials.repo,
      branch: credentials.branch,
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
      ...(credentials.gitlabProjectRef !== undefined
        ? { gitlabProjectRef: credentials.gitlabProjectRef }
        : {}),
      ...(credentials.gitlabBaseUrl !== undefined
        ? { gitlabBaseUrl: credentials.gitlabBaseUrl }
        : {}),
      ...(credentials.bitbucketUsername !== undefined
        ? { bitbucketUsername: credentials.bitbucketUsername }
        : {}),
      ...(credentials.wordpressApiUrl !== undefined
        ? { wordpressApiUrl: credentials.wordpressApiUrl }
        : {}),
      ...(credentials.wordpressUsername !== undefined
        ? { wordpressUsername: credentials.wordpressUsername }
        : {}),
      ...(credentials.wordpressAppPassword !== undefined
        ? { wordpressAppPassword: credentials.wordpressAppPassword }
        : {}),
      ...(credentials.wordpressDefaultStatus !== undefined
        ? { wordpressDefaultStatus: credentials.wordpressDefaultStatus }
        : {}),
      ...(credentials.wordpressDefaultAuthor !== undefined
        ? { wordpressDefaultAuthor: credentials.wordpressDefaultAuthor }
        : {}),
      ...(credentials.ghostAdminUrl !== undefined
        ? { ghostAdminUrl: credentials.ghostAdminUrl }
        : {}),
      ...(credentials.ghostAdminApiKey !== undefined
        ? { ghostAdminApiKey: credentials.ghostAdminApiKey }
        : {}),
      ...(credentials.ghostAcceptVersion !== undefined
        ? { ghostAcceptVersion: credentials.ghostAcceptVersion }
        : {}),
      ...(credentials.ghostDefaultStatus !== undefined
        ? { ghostDefaultStatus: credentials.ghostDefaultStatus }
        : {}),
      categories: project.categories,
      publishMode: resolvePublishModeFromEnv(),
      prBranchPrefix: resolvePrBranchPrefix(),
      prDraft: parseBooleanEnv(process.env.SOURCEDRAFT_PR_DRAFT, false),
    },
  };
}

export type PublicStudioConfig = Omit<PublishEnvConfig, "token">;

function publicPublisherPaths(
  publisher: SupportedPublisher,
  defaultBranch: string,
): Pick<PublicStudioConfig, "owner" | "repo" | "branch"> {
  if (publisher === "gitlab") {
    return {
      owner:
        process.env.GITLAB_PROJECT_PATH?.trim() ||
        process.env.GITLAB_PROJECT_ID?.trim() ||
        "",
      repo: "",
      branch: process.env.GITLAB_BRANCH?.trim() || defaultBranch,
    };
  }

  if (publisher === "bitbucket") {
    return {
      owner: process.env.BITBUCKET_WORKSPACE?.trim() || "",
      repo: process.env.BITBUCKET_REPO_SLUG?.trim() || "",
      branch: process.env.BITBUCKET_BRANCH?.trim() || defaultBranch,
    };
  }

  if (publisher === "wordpress") {
    return {
      owner: process.env.WORDPRESS_API_URL?.trim() || "",
      repo: "",
      branch: defaultBranch,
    };
  }

  if (publisher === "ghost") {
    return {
      owner: process.env.GHOST_ADMIN_URL?.trim() || "",
      repo: "",
      branch: defaultBranch,
    };
  }

  return {
    owner: process.env.GITHUB_OWNER?.trim() || "",
    repo: process.env.GITHUB_REPO?.trim() || "",
    branch: process.env.GITHUB_BRANCH?.trim() || defaultBranch,
  };
}

export function loadPublicConfig(): PublicStudioConfig {
  const project = loadProjectConfig();
  const rawAdapter = process.env.CMS_ADAPTER?.trim() || project.adapter;
  const rawPublisher = process.env.CMS_PUBLISHER?.trim() || project.publisher;
  const adapter = resolveAdapter(rawAdapter) ?? "astro-mdx";
  const publisher = resolvePublisher(rawPublisher) ?? "github";
  const mediaDir = process.env.CMS_MEDIA_DIR?.trim() || project.mediaDir;
  const { owner, repo, branch } = publicPublisherPaths(
    publisher,
    project.defaultBranch,
  );

  return {
    owner,
    repo,
    branch,
    contentDir: process.env.CMS_CONTENT_DIR?.trim() || project.contentDir,
    mediaDir,
    publicMediaPath: resolvePublicMediaPath(mediaDir, project),
    adapter,
    publisher,
    publishMode: resolvePublishModeFromEnv(),
    prBranchPrefix: resolvePrBranchPrefix(),
    prDraft: parseBooleanEnv(process.env.SOURCEDRAFT_PR_DRAFT, false),
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
