import { isAdapterId } from "@sourcedraft/adapters";
import { isPublisherId } from "@sourcedraft/publishers";
import { validateConfig } from "@sourcedraft/setup";
import { isAuthConfigured } from "./auth.js";
import { loadProjectConfig, loadPublicConfig } from "./config.js";
import {
  isBitbucketConfigured,
  isBitbucketRepoConfigured,
  isBitbucketTokenConfigured,
  isBitbucketWorkspaceConfigured,
  isDemoModeAvailable,
  isDemoModeForced,
  isGitHubConfigured,
  isGitHubOwnerConfigured,
  isGitHubRepoConfigured,
  isGitHubTokenConfigured,
  isGitLabConfigured,
  isGitLabProjectConfigured,
  isGitLabTokenConfigured,
  isGhostAdminApiKeyConfigured,
  isGhostAdminUrlConfigured,
  isPublisherConfigured,
  isWordPressApiConfigured,
  isWordPressAppPasswordConfigured,
  isWordPressUsernameConfigured,
  resolveActivePublisher,
} from "./demoMode.js";

export type SetupHealthCheck = {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type SetupCompatibilityReport = {
  adapter: string;
  publisher: string;
  mediaProvider: string;
  validationOk: boolean;
  missingEnvVars: string[];
  warnings: string[];
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
  compatibility: SetupCompatibilityReport;
  checks: SetupHealthCheck[];
  nextAction: string | null;
};

function publisherCredentialChecks(activePublisher: string): SetupHealthCheck[] {
  if (activePublisher === "gitlab") {
    const tokenOk = isGitLabTokenConfigured();
    const projectOk = isGitLabProjectConfigured();
    return [
      {
        id: "gitlab-token",
        label: "GitLab token (server-side)",
        ok: tokenOk,
        detail: tokenOk
          ? "GITLAB_TOKEN is present on the server. The value is never sent to the browser."
          : "Set GITLAB_TOKEN in .env for GitLab publishing.",
      },
      {
        id: "gitlab-project",
        label: "GitLab project",
        ok: projectOk,
        detail: projectOk
          ? "GITLAB_PROJECT_ID or GITLAB_PROJECT_PATH is configured."
          : "Set GITLAB_PROJECT_ID or GITLAB_PROJECT_PATH in .env.",
      },
    ];
  }

  if (activePublisher === "bitbucket") {
    const tokenOk = isBitbucketTokenConfigured();
    const workspaceOk = isBitbucketWorkspaceConfigured();
    const repoOk = isBitbucketRepoConfigured();
    return [
      {
        id: "bitbucket-token",
        label: "Bitbucket token (server-side)",
        ok: tokenOk,
        detail: tokenOk
          ? "BITBUCKET_TOKEN is present on the server. The value is never sent to the browser."
          : "Set BITBUCKET_TOKEN in .env for Bitbucket publishing.",
      },
      {
        id: "bitbucket-workspace",
        label: "Bitbucket workspace",
        ok: workspaceOk,
        detail: workspaceOk
          ? "BITBUCKET_WORKSPACE is configured."
          : "Set BITBUCKET_WORKSPACE in .env.",
      },
      {
        id: "bitbucket-repo",
        label: "Bitbucket repository",
        ok: repoOk,
        detail: repoOk
          ? "BITBUCKET_REPO_SLUG is configured."
          : "Set BITBUCKET_REPO_SLUG in .env.",
      },
    ];
  }

  if (activePublisher === "wordpress") {
    const apiOk = isWordPressApiConfigured();
    const userOk = isWordPressUsernameConfigured();
    const passwordOk = isWordPressAppPasswordConfigured();
    return [
      {
        id: "wordpress-api-url",
        label: "WordPress API URL",
        ok: apiOk,
        detail: apiOk
          ? "WORDPRESS_API_URL is configured."
          : "Set WORDPRESS_API_URL in .env (e.g. https://example.com/wp-json).",
      },
      {
        id: "wordpress-username",
        label: "WordPress username",
        ok: userOk,
        detail: userOk
          ? "WORDPRESS_USERNAME is configured."
          : "Set WORDPRESS_USERNAME in .env.",
      },
      {
        id: "wordpress-app-password",
        label: "WordPress app password (server-side)",
        ok: passwordOk,
        detail: passwordOk
          ? "WORDPRESS_APP_PASSWORD is present on the server. The value is never sent to the browser."
          : "Set WORDPRESS_APP_PASSWORD in .env.",
      },
    ];
  }

  if (activePublisher === "ghost") {
    const urlOk = isGhostAdminUrlConfigured();
    const keyOk = isGhostAdminApiKeyConfigured();
    return [
      {
        id: "ghost-admin-url",
        label: "Ghost site URL",
        ok: urlOk,
        detail: urlOk
          ? "GHOST_ADMIN_URL is configured."
          : "Set GHOST_ADMIN_URL in .env (site root, no /ghost path).",
      },
      {
        id: "ghost-admin-api-key",
        label: "Ghost Admin API key (server-side)",
        ok: keyOk,
        detail: keyOk
          ? "GHOST_ADMIN_API_KEY is present on the server. The value is never sent to the browser."
          : "Set GHOST_ADMIN_API_KEY in .env.",
      },
    ];
  }

  const ownerOk = isGitHubOwnerConfigured();
  const repoOk = isGitHubRepoConfigured();
  const tokenOk = isGitHubTokenConfigured();
  return [
    {
      id: "github-owner",
      label: "GitHub owner",
      ok: ownerOk,
      detail: ownerOk
        ? "GITHUB_OWNER is configured."
        : "Set GITHUB_OWNER in .env.",
    },
    {
      id: "github-repo",
      label: "GitHub repository",
      ok: repoOk,
      detail: repoOk ? "GITHUB_REPO is configured." : "Set GITHUB_REPO in .env.",
    },
    {
      id: "github-token",
      label: "GitHub token (server-side)",
      ok: tokenOk,
      detail: tokenOk
        ? "GITHUB_TOKEN is present on the server. The value is never sent to the browser."
        : "Set GITHUB_TOKEN in .env for GitHub publishing.",
    },
  ];
}

function publisherSetupMessage(activePublisher: string): string {
  if (activePublisher === "gitlab") {
    return "Complete GitLab setup in .env (GITLAB_TOKEN, GITLAB_PROJECT_ID or GITLAB_PROJECT_PATH) or use demo mode to explore without GitLab.";
  }

  if (activePublisher === "bitbucket") {
    return "Complete Bitbucket setup in .env (BITBUCKET_TOKEN, BITBUCKET_WORKSPACE, BITBUCKET_REPO_SLUG) or use demo mode to explore without Bitbucket.";
  }

  if (activePublisher === "wordpress") {
    return "Complete WordPress setup in .env (WORDPRESS_API_URL, WORDPRESS_USERNAME, WORDPRESS_APP_PASSWORD) or use demo mode to explore without WordPress.";
  }

  if (activePublisher === "ghost") {
    return "Complete Ghost setup in .env (GHOST_ADMIN_URL, GHOST_ADMIN_API_KEY) or use demo mode to explore without Ghost.";
  }

  return "Complete GitHub setup in .env (GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO) or use demo mode to explore without GitHub.";
}

export function getSetupHealth(): SetupHealthReport {
  const project = loadProjectConfig();
  const runtime = loadPublicConfig();
  const rawAdapter = process.env.CMS_ADAPTER?.trim() || project.adapter;
  const rawPublisher = process.env.CMS_PUBLISHER?.trim() || project.publisher;
  const adapter = isAdapterId(rawAdapter) ? rawAdapter : null;
  const publisher = isPublisherId(rawPublisher) ? rawPublisher : null;
  const activePublisher = resolveActivePublisher();
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
  const publisherReady =
    isPublisherConfigured() && adapterValid && publisherValid;

  const checks: SetupHealthCheck[] = [
    {
      id: "admin-password",
      label: "Admin password",
      ok: adminPasswordConfigured,
      detail: adminPasswordConfigured
        ? "SOURCEDRAFT_ADMIN_PASSWORD is set on the server."
        : "Set SOURCEDRAFT_ADMIN_PASSWORD in .env for normal sign-in.",
    },
    ...publisherCredentialChecks(activePublisher),
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
        ? "SOURCEDRAFT_DEMO_MODE=true — remote commits are disabled."
        : !isPublisherConfigured()
          ? "Publisher is not fully configured — Studio uses demo content and simulated publish."
          : "Demo mode is off. Publishing is enabled when credentials are valid.",
    },
  ];

  let nextAction: string | null = null;

  if (demoModeForced) {
    nextAction =
      "Demo mode is active. Explore Studio locally or configure your publisher and disable SOURCEDRAFT_DEMO_MODE for real publishing.";
  } else if (!adminPasswordConfigured && demoModeAvailable) {
    nextAction =
      "Enter demo mode from the sign-in screen or set SOURCEDRAFT_ADMIN_PASSWORD for password sign-in.";
  } else if (!adminPasswordConfigured) {
    nextAction = "Set SOURCEDRAFT_ADMIN_PASSWORD in .env and restart the API server.";
  } else if (!publisherReady) {
    nextAction = publisherSetupMessage(activePublisher);
  } else {
    nextAction = null;
  }

  const validation = validateConfig();
  const compatibility: SetupCompatibilityReport = {
    adapter: validation.adapter,
    publisher: validation.publisher,
    mediaProvider: validation.mediaProvider,
    validationOk: validation.ok,
    missingEnvVars: validation.missingEnvVars,
    warnings: validation.warnings,
  };

  if (!validation.ok && validation.missingEnvVars.length > 0) {
    checks.push({
      id: "config-validation",
      label: "Configuration validation",
      ok: false,
      detail: `Missing: ${validation.missingEnvVars.join(", ")}. Run pnpm validate:config for details.`,
    });
  } else if (validation.warnings.length > 0) {
    checks.push({
      id: "config-validation",
      label: "Configuration validation",
      ok: true,
      detail: validation.warnings[0] ?? "Configuration validated with warnings.",
    });
  } else {
    checks.push({
      id: "config-validation",
      label: "Configuration validation",
      ok: validation.ok,
      detail: validation.ok
        ? "Adapter, publisher, and media provider look compatible."
        : "Run pnpm validate:config locally for details.",
    });
  }

  return {
    ok: publisherReady || demoModeAvailable,
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
    githubReady: publisherReady,
    compatibility,
    checks,
    nextAction,
  };
}

export function isRequestInDemoMode(sessionDemo: boolean): boolean {
  return isDemoModeForced() || !isPublisherConfigured() || sessionDemo;
}
