import { isAdapterId } from "@sourcedraft/adapters";
import { isPublisherId } from "@sourcedraft/publishers";
import { isAuthConfigured } from "./auth.js";
import { loadProjectConfig, loadPublicConfig } from "./config.js";
import {
  isDemoModeAvailable,
  isDemoModeForced,
  isGitHubConfigured,
  isGitHubOwnerConfigured,
  isGitHubRepoConfigured,
  isGitHubTokenConfigured,
} from "./demoMode.js";

export type SetupHealthCheck = {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type SetupHealthReport = {
  ok: boolean;
  adminPasswordConfigured: boolean;
  githubOwnerConfigured: boolean;
  githubRepoConfigured: boolean;
  githubTokenConfigured: boolean;
  contentDirConfigured: boolean;
  mediaDirConfigured: boolean;
  publicMediaPathConfigured: boolean;
  adapterValid: boolean;
  publisherValid: boolean;
  demoModeForced: boolean;
  demoModeAvailable: boolean;
  githubReady: boolean;
  checks: SetupHealthCheck[];
  nextAction: string | null;
};

export function getSetupHealth(): SetupHealthReport {
  const project = loadProjectConfig();
  const runtime = loadPublicConfig();
  const rawAdapter = process.env.CMS_ADAPTER?.trim() || project.adapter;
  const rawPublisher = process.env.CMS_PUBLISHER?.trim() || project.publisher;
  const adapter = isAdapterId(rawAdapter) ? rawAdapter : null;
  const publisher = isPublisherId(rawPublisher) ? rawPublisher : null;
  const contentDir = runtime.contentDir.trim();
  const mediaDir = runtime.mediaDir.trim();
  const publicMediaPath = runtime.publicMediaPath.trim();

  const adminPasswordConfigured = isAuthConfigured();
  const githubOwnerConfigured = isGitHubOwnerConfigured();
  const githubRepoConfigured = isGitHubRepoConfigured();
  const githubTokenConfigured = isGitHubTokenConfigured();
  const contentDirConfigured = contentDir.length > 0;
  const mediaDirConfigured = mediaDir.length > 0;
  const publicMediaPathConfigured = publicMediaPath.length > 0;
  const adapterValid = adapter !== null;
  const publisherValid = publisher !== null;
  const demoModeForced = isDemoModeForced();
  const demoModeAvailable = isDemoModeAvailable();
  const githubReady =
    githubOwnerConfigured &&
    githubRepoConfigured &&
    githubTokenConfigured &&
    adapterValid &&
    publisherValid;

  const checks: SetupHealthCheck[] = [
    {
      id: "admin-password",
      label: "Admin password",
      ok: adminPasswordConfigured,
      detail: adminPasswordConfigured
        ? "SOURCEDRAFT_ADMIN_PASSWORD is set on the server."
        : "Set SOURCEDRAFT_ADMIN_PASSWORD in .env for normal sign-in.",
    },
    {
      id: "github-owner",
      label: "GitHub owner",
      ok: githubOwnerConfigured,
      detail: githubOwnerConfigured
        ? "GITHUB_OWNER is configured."
        : "Set GITHUB_OWNER in .env.",
    },
    {
      id: "github-repo",
      label: "GitHub repository",
      ok: githubRepoConfigured,
      detail: githubRepoConfigured
        ? "GITHUB_REPO is configured."
        : "Set GITHUB_REPO in .env.",
    },
    {
      id: "github-token",
      label: "GitHub token (server-side)",
      ok: githubTokenConfigured,
      detail: githubTokenConfigured
        ? "GITHUB_TOKEN is present on the server. The value is never sent to the browser."
        : "Set GITHUB_TOKEN in .env for GitHub publishing.",
    },
    {
      id: "content-dir",
      label: "Content directory",
      ok: contentDirConfigured,
      detail: contentDirConfigured
        ? `contentDir: ${contentDir}`
        : "Configure contentDir in sourcedraft.config.json.",
    },
    {
      id: "media-dir",
      label: "Media directory",
      ok: mediaDirConfigured,
      detail: mediaDirConfigured
        ? `mediaDir: ${mediaDir}`
        : "Configure mediaDir in sourcedraft.config.json.",
    },
    {
      id: "public-media-path",
      label: "Public media path",
      ok: publicMediaPathConfigured,
      detail: publicMediaPathConfigured
        ? `publicMediaPath: ${publicMediaPath}`
        : "Configure publicMediaPath in sourcedraft.config.json or CMS_PUBLIC_MEDIA_PATH.",
    },
    {
      id: "adapter",
      label: "Adapter",
      ok: adapterValid,
      detail: adapterValid
        ? `Using ${adapter} adapter.`
        : `Unsupported adapter "${rawAdapter}". Use a built-in adapter id from docs/adapters.md.`,
    },
    {
      id: "publisher",
      label: "Publisher",
      ok: publisherValid,
      detail: publisherValid
        ? `Using ${publisher} publisher.`
        : `Unsupported publisher "${rawPublisher}". Use a built-in publisher id from docs/configuration.md.`,
    },
    {
      id: "demo-mode",
      label: "Demo mode",
      ok: true,
      detail: demoModeForced
        ? "SOURCEDRAFT_DEMO_MODE=true — GitHub commits are disabled."
        : !isGitHubConfigured()
          ? "GitHub is not fully configured — Studio uses demo content and simulated publish."
          : "Demo mode is off. GitHub publishing is enabled when credentials are valid.",
    },
  ];

  let nextAction: string | null = null;

  if (demoModeForced) {
    nextAction =
      "Demo mode is active. Explore Studio locally or configure GitHub and disable SOURCEDRAFT_DEMO_MODE for real publishing.";
  } else if (!adminPasswordConfigured && demoModeAvailable) {
    nextAction =
      "Enter demo mode from the sign-in screen or set SOURCEDRAFT_ADMIN_PASSWORD for password sign-in.";
  } else if (!adminPasswordConfigured) {
    nextAction = "Set SOURCEDRAFT_ADMIN_PASSWORD in .env and restart the API server.";
  } else if (!githubReady) {
    nextAction =
      "Complete GitHub setup in .env (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO) or use demo mode to explore without GitHub.";
  } else {
    nextAction = null;
  }

  return {
    ok: githubReady || demoModeAvailable,
    adminPasswordConfigured,
    githubOwnerConfigured,
    githubRepoConfigured,
    githubTokenConfigured,
    contentDirConfigured,
    mediaDirConfigured,
    publicMediaPathConfigured,
    adapterValid,
    publisherValid,
    demoModeForced,
    demoModeAvailable,
    githubReady,
    checks,
    nextAction,
  };
}

export function isRequestInDemoMode(sessionDemo: boolean): boolean {
  return isDemoModeForced() || !isGitHubConfigured() || sessionDemo;
}
