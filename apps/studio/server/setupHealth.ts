import { isAdapterId } from "@sourcedraft/adapters";
import { isPublisherId } from "@sourcedraft/publishers";
import { validateConfig } from "@sourcedraft/setup";
import { isAuthConfigured } from "./auth.js";
import { loadProjectConfig, loadPublicConfig } from "./config.js";
import {
  isBitbucketRepoConfigured,
  isBitbucketTokenConfigured,
  isBitbucketWorkspaceConfigured,
  isDemoModeAvailable,
  isDemoModeForced,
  isGitHubOwnerConfigured,
  isGitHubRepoConfigured,
  isGitHubTokenConfigured,
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
        label: "GitLab connection",
        ok: tokenOk,
        detail: tokenOk
          ? "GitLab is connected on the server. Credentials never appear in the browser."
          : "Publishing to GitLab is not connected yet. Add a GitLab token in .env or ask the person who installed SourceDraft.",
      },
      {
        id: "gitlab-project",
        label: "GitLab project",
        ok: projectOk,
        detail: projectOk
          ? "SourceDraft knows which GitLab project to update."
          : "SourceDraft does not know which GitLab project stores your site yet.",
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
        label: "Bitbucket connection",
        ok: tokenOk,
        detail: tokenOk
          ? "Bitbucket is connected on the server. Credentials never appear in the browser."
          : "Publishing to Bitbucket is not connected yet. Add a Bitbucket token in .env or ask the person who installed SourceDraft.",
      },
      {
        id: "bitbucket-workspace",
        label: "Bitbucket workspace",
        ok: workspaceOk,
        detail: workspaceOk
          ? "SourceDraft knows which Bitbucket workspace owns your blog."
          : "SourceDraft does not know which Bitbucket workspace to use yet.",
      },
      {
        id: "bitbucket-repo",
        label: "Bitbucket repository",
        ok: repoOk,
        detail: repoOk
          ? "SourceDraft knows which Bitbucket repository stores your site."
          : "SourceDraft does not know which Bitbucket repository stores your site yet.",
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
        label: "WordPress site address",
        ok: apiOk,
        detail: apiOk
          ? "SourceDraft knows where your WordPress site lives."
          : "SourceDraft does not know your WordPress site address yet.",
      },
      {
        id: "wordpress-username",
        label: "WordPress sign-in",
        ok: userOk,
        detail: userOk
          ? "A WordPress username is configured for publishing."
          : "SourceDraft needs a WordPress username before it can publish posts.",
      },
      {
        id: "wordpress-app-password",
        label: "WordPress app password",
        ok: passwordOk,
        detail: passwordOk
          ? "WordPress publishing credentials are stored on the server only."
          : "Publishing to WordPress is not connected yet. Add an app password in .env or ask the person who installed SourceDraft.",
      },
    ];
  }

  if (activePublisher === "ghost") {
    const urlOk = isGhostAdminUrlConfigured();
    const keyOk = isGhostAdminApiKeyConfigured();
    return [
      {
        id: "ghost-admin-url",
        label: "Ghost site address",
        ok: urlOk,
        detail: urlOk
          ? "SourceDraft knows where your Ghost site lives."
          : "SourceDraft does not know your Ghost site address yet.",
      },
      {
        id: "ghost-admin-api-key",
        label: "Ghost Admin connection",
        ok: keyOk,
        detail: keyOk
          ? "Ghost publishing credentials are stored on the server only."
          : "Publishing to Ghost is not connected yet. Add a Ghost Admin API key in .env or ask the person who installed SourceDraft.",
      },
    ];
  }

  const ownerOk = isGitHubOwnerConfigured();
  const repoOk = isGitHubRepoConfigured();
  const tokenOk = isGitHubTokenConfigured();
  return [
    {
      id: "github-owner",
      label: "GitHub account or organization",
      ok: ownerOk,
      detail: ownerOk
        ? "SourceDraft knows which GitHub account owns your blog."
        : "SourceDraft does not know which GitHub account owns your blog yet.",
    },
    {
      id: "github-repo",
      label: "Blog repository",
      ok: repoOk,
      detail: repoOk
        ? "SourceDraft knows which repository stores your site."
        : "SourceDraft does not know which repository stores your site yet.",
    },
    {
      id: "github-token",
      label: "GitHub connection",
      ok: tokenOk,
      detail: tokenOk
        ? "GitHub is connected on the server. Credentials never appear in the browser."
        : "Publishing to GitHub is not connected yet. Add a GitHub token in .env or ask the person who installed SourceDraft.",
    },
  ];
}

function publisherSetupMessage(activePublisher: string): string {
  if (activePublisher === "gitlab") {
    return "Finish connecting SourceDraft to your GitLab project, or try demo mode to explore without publishing.";
  }

  if (activePublisher === "bitbucket") {
    return "Finish connecting SourceDraft to your Bitbucket repository, or try demo mode to explore without publishing.";
  }

  if (activePublisher === "wordpress") {
    return "Finish connecting SourceDraft to your WordPress site, or try demo mode to explore without publishing.";
  }

  if (activePublisher === "ghost") {
    return "Finish connecting SourceDraft to your Ghost site, or try demo mode to explore without publishing.";
  }

  return "Finish connecting SourceDraft to your GitHub blog repository, or try demo mode to explore without publishing.";
}

function adapterDisplayName(adapter: string): string {
  switch (adapter) {
    case "astro-mdx":
      return "Astro";
    case "markdown":
      return "Markdown";
    case "nextjs-mdx":
      return "Next.js";
    case "hugo-markdown":
      return "Hugo";
    case "eleventy-jekyll-markdown":
      return "Eleventy or Jekyll";
    case "docusaurus-mdx":
      return "Docusaurus";
    case "mkdocs-markdown":
      return "MkDocs";
    case "nuxt-content-markdown":
      return "Nuxt Content";
    default:
      return adapter;
  }
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
      label: "Studio password",
      ok: adminPasswordConfigured,
      detail: adminPasswordConfigured
        ? "Writers can sign in with the Studio password."
        : "Add a Studio password on the server, or use demo mode to explore without signing in.",
    },
    ...publisherCredentialChecks(activePublisher),
    {
      id: "content-dir",
      label: "Article folder",
      ok: contentDirConfigured,
      detail: contentDirConfigured
        ? `Articles will be saved in ${contentDir}.`
        : "SourceDraft does not know where your articles should be saved yet.",
    },
    {
      id: "media-dir",
      label: "Image folder",
      ok: mediaDirConfigured,
      detail: mediaDirConfigured
        ? `Uploaded images will be saved in ${mediaDir}.`
        : "SourceDraft does not know where uploaded images should be saved yet.",
    },
    {
      id: "public-media-path",
      label: "Public image path",
      ok: publicMediaPathConfigured,
      detail: publicMediaPathConfigured
        ? `Images will appear on your site under ${publicMediaPath}.`
        : "SourceDraft does not know the web path for images on your site yet.",
    },
    {
      id: "adapter",
      label: "Blog type",
      ok: adapterValid,
      detail: adapterValid
        ? `SourceDraft is writing for ${adapterDisplayName(adapter)}.`
        : "Choose the blog type SourceDraft should write for, such as Astro, Hugo, or Next.js.",
    },
    {
      id: "publisher",
      label: "Publishing destination",
      ok: publisherValid,
      detail: publisherValid
        ? `Finished articles are sent through ${publisher}.`
        : "Choose where SourceDraft should send finished articles.",
    },
    {
      id: "demo-mode",
      label: "Demo mode",
      ok: true,
      detail: demoModeForced
        ? "Demo mode is forced on. Explore safely — nothing is sent to a real blog."
        : !isPublisherConfigured()
          ? "Your blog is not fully connected yet. Studio shows sample articles and simulates publishing."
          : "Publishing to your connected blog is available when the checks above pass.",
    },
  ];

  const nextAction = demoModeForced
    ? "You are in demo mode. Explore Studio safely, then ask your technical helper to connect a real blog when you are ready."
    : !adminPasswordConfigured && demoModeAvailable
      ? "Try demo mode from the sign-in screen, or ask your technical helper to add a Studio password."
      : !adminPasswordConfigured
        ? "Ask your technical helper to add a Studio password on the server."
        : !publisherReady
          ? publisherSetupMessage(activePublisher)
          : null;

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
      label: "Full setup check",
      ok: false,
      detail:
        "Some server settings are still missing. Ask your technical helper to run the guided setup or check the README.",
    });
  } else if (validation.warnings.length > 0) {
    checks.push({
      id: "config-validation",
      label: "Full setup check",
      ok: true,
      detail: validation.warnings[0] ?? "Setup looks mostly ready, with a few warnings to review.",
    });
  } else {
    checks.push({
      id: "config-validation",
      label: "Full setup check",
      ok: validation.ok,
      detail: validation.ok
        ? "Blog type, publishing destination, and image storage look compatible."
        : "Ask your technical helper to review the setup guide in the README.",
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
