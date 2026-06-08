import type { PublisherId } from "@sourcedraft/publishers";
import type { MediaProviderId } from "@sourcedraft/media-providers";

export type EnvRequirement = {
  key: string;
  label: string;
  help: string;
  required: boolean;
};

const GIT_PUBLISHERS = new Set<PublisherId>(["github", "gitlab", "bitbucket"]);
const CMS_PUBLISHERS = new Set<PublisherId>(["wordpress", "ghost"]);

export function publisherEnvRequirements(
  publisher: string,
): EnvRequirement[] {
  switch (publisher) {
    case "github":
      return [
        {
          key: "GITHUB_TOKEN",
          label: "GitHub personal access token",
          help: "Create one at GitHub → Settings → Developer settings → Personal access tokens. Needs repo scope for private repos.",
          required: true,
        },
        {
          key: "GITHUB_OWNER",
          label: "GitHub username or organization",
          help: "The account that owns the repository, e.g. acme-corp.",
          required: true,
        },
        {
          key: "GITHUB_REPO",
          label: "GitHub repository name",
          help: "Just the repo name, not the full URL — e.g. my-blog.",
          required: true,
        },
        {
          key: "GITHUB_BRANCH",
          label: "Default branch",
          help: "Usually main or master. Articles are committed to this branch.",
          required: false,
        },
      ];
    case "gitlab":
      return [
        {
          key: "GITLAB_TOKEN",
          label: "GitLab personal access token",
          help: "GitLab → Preferences → Access Tokens with api scope.",
          required: true,
        },
        {
          key: "GITLAB_PROJECT_ID",
          label: "GitLab project ID",
          help: "Numeric project ID from the project home page, or use GITLAB_PROJECT_PATH instead.",
          required: false,
        },
        {
          key: "GITLAB_PROJECT_PATH",
          label: "GitLab project path",
          help: "group/subgroup/project — alternative to project ID.",
          required: false,
        },
        {
          key: "GITLAB_BRANCH",
          label: "Default branch",
          help: "Branch for commits, usually main.",
          required: false,
        },
        {
          key: "GITLAB_BASE_URL",
          label: "GitLab base URL",
          help: "https://gitlab.com for GitLab.com, or your self-hosted URL.",
          required: false,
        },
      ];
    case "bitbucket":
      return [
        {
          key: "BITBUCKET_TOKEN",
          label: "Bitbucket app password or token",
          help: "Bitbucket → Personal settings → App passwords with repository write.",
          required: true,
        },
        {
          key: "BITBUCKET_WORKSPACE",
          label: "Bitbucket workspace",
          help: "The workspace slug in your repo URL.",
          required: true,
        },
        {
          key: "BITBUCKET_REPO_SLUG",
          label: "Bitbucket repository slug",
          help: "The repo name from the URL, e.g. my-blog.",
          required: true,
        },
        {
          key: "BITBUCKET_BRANCH",
          label: "Default branch",
          help: "Branch for commits, usually main.",
          required: false,
        },
        {
          key: "BITBUCKET_USERNAME",
          label: "Bitbucket username",
          help: "Your Bitbucket username — required for some API calls.",
          required: false,
        },
      ];
    case "wordpress":
      return [
        {
          key: "WORDPRESS_API_URL",
          label: "WordPress site URL",
          help: "Your site root, e.g. https://blog.example.com — no trailing slash.",
          required: true,
        },
        {
          key: "WORDPRESS_USERNAME",
          label: "WordPress username",
          help: "A user with permission to create posts.",
          required: true,
        },
        {
          key: "WORDPRESS_APP_PASSWORD",
          label: "WordPress application password",
          help: "Users → Profile → Application Passwords. Not your login password.",
          required: true,
        },
      ];
    case "ghost":
      return [
        {
          key: "GHOST_ADMIN_URL",
          label: "Ghost Admin URL",
          help: "Your Ghost site URL, e.g. https://blog.example.com.",
          required: true,
        },
        {
          key: "GHOST_ADMIN_API_KEY",
          label: "Ghost Admin API key",
          help: "Ghost Admin → Settings → Integrations → Add custom integration.",
          required: true,
        },
      ];
    default:
      return [];
  }
}

export function mediaProviderEnvRequirements(
  mediaProvider: string,
): EnvRequirement[] {
  switch (mediaProvider) {
    case "github-media":
      return [];
    case "cloudinary":
      return [
        {
          key: "CLOUDINARY_CLOUD_NAME",
          label: "Cloudinary cloud name",
          help: "From your Cloudinary dashboard.",
          required: true,
        },
        {
          key: "CLOUDINARY_API_KEY",
          label: "Cloudinary API key",
          help: "Dashboard → API Keys.",
          required: true,
        },
        {
          key: "CLOUDINARY_API_SECRET",
          label: "Cloudinary API secret",
          help: "Keep server-side only — never expose in the browser.",
          required: true,
        },
        {
          key: "CLOUDINARY_FOLDER",
          label: "Cloudinary upload folder",
          help: "Optional folder prefix for uploads.",
          required: false,
        },
      ];
    case "s3-compatible":
      return [
        {
          key: "S3_ENDPOINT",
          label: "S3 endpoint URL",
          help: "e.g. https://s3.amazonaws.com or your MinIO URL.",
          required: true,
        },
        {
          key: "S3_BUCKET",
          label: "S3 bucket name",
          help: "Bucket where media files are stored.",
          required: true,
        },
        {
          key: "S3_ACCESS_KEY_ID",
          label: "S3 access key ID",
          help: "Access key with write permission to the bucket.",
          required: true,
        },
        {
          key: "S3_SECRET_ACCESS_KEY",
          label: "S3 secret access key",
          help: "Keep server-side only.",
          required: true,
        },
        {
          key: "S3_REGION",
          label: "S3 region",
          help: "e.g. us-east-1 — required for AWS and many providers.",
          required: false,
        },
        {
          key: "S3_PUBLIC_BASE_URL",
          label: "Public base URL for media",
          help: "CDN or bucket URL visitors use to load images.",
          required: false,
        },
      ];
    default:
      return [];
  }
}

export function deployHookEnvRequirements(): EnvRequirement[] {
  return [
    {
      key: "DEPLOY_HOOK_URL",
      label: "Deploy hook URL",
      help: "Webhook from Netlify, Vercel, Cloudflare Pages, etc. Called after a successful publish.",
      required: true,
    },
    {
      key: "DEPLOY_HOOK_METHOD",
      label: "HTTP method",
      help: "Usually POST. Leave as POST unless your host says otherwise.",
      required: false,
    },
    {
      key: "DEPLOY_HOOK_PROVIDER",
      label: "Provider hint",
      help: "generic, netlify, vercel, or cloudflare — used for logging only.",
      required: false,
    },
    {
      key: "DEPLOY_HOOK_STRICT",
      label: "Fail publish on hook error",
      help: "Set true only if a failed deploy must block publishing.",
      required: false,
    },
  ];
}

export function isGitPublisher(publisher: string): boolean {
  return GIT_PUBLISHERS.has(publisher as PublisherId);
}

export function isCmsPublisher(publisher: string): boolean {
  return CMS_PUBLISHERS.has(publisher as PublisherId);
}

export function resolveMediaProviderId(env: Record<string, string | undefined>): string {
  const raw = env.CMS_MEDIA_PROVIDER?.trim();
  if (raw && raw.length > 0) {
    return raw;
  }

  return "github-media";
}

export function resolvePublisherId(
  configPublisher: string,
  env: Record<string, string | undefined>,
): string {
  const fromEnv = env.CMS_PUBLISHER?.trim();
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv;
  }

  return configPublisher;
}

export function missingRequiredEnvVars(
  requirements: EnvRequirement[],
  env: Record<string, string | undefined>,
): string[] {
  const missing: string[] = [];

  for (const req of requirements) {
    if (!req.required) {
      continue;
    }

    const value = env[req.key]?.trim();
    if (!value) {
      missing.push(req.key);
    }
  }

  return missing;
}

export function validatePublisherSpecificRules(
  publisher: string,
  env: Record<string, string | undefined>,
): string[] {
  const errors: string[] = [];

  if (publisher === "gitlab") {
    const hasId = Boolean(env.GITLAB_PROJECT_ID?.trim());
    const hasPath = Boolean(env.GITLAB_PROJECT_PATH?.trim());
    if (!hasId && !hasPath) {
      errors.push("Set GITLAB_PROJECT_ID or GITLAB_PROJECT_PATH.");
    }
  }

  return errors;
}
