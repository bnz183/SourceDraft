import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { listAdapterIds, isAdapterId } from "@sourcedraft/adapters";
import { loadSourceDraftConfig, resolveConfigPath } from "@sourcedraft/config";
import { isMediaProviderId } from "@sourcedraft/media-providers";
import { isPublisherId } from "@sourcedraft/publishers";
import {
  checkDeployHookUrlShape,
  checkPublisherConnection,
  type ConnectionCheckResult,
} from "./connectionChecks.js";
import {
  deployHookEnvRequirements,
  isCmsPublisher,
  isGitPublisher,
  mediaProviderEnvRequirements,
  missingRequiredEnvVars,
  publisherEnvRequirements,
  resolveMediaProviderId,
  resolvePublisherId,
  validatePublisherSpecificRules,
} from "./envRequirements.js";
import { isValidPublicMediaPath, isValidRepoPath } from "./paths.js";

export type ValidationLevel = "error" | "warning";

export type ValidationIssue = {
  level: ValidationLevel;
  field: string;
  message: string;
};

export type ValidationReport = {
  ok: boolean;
  adapter: string;
  publisher: string;
  mediaProvider: string;
  configPath: string | null;
  envPath: string | null;
  issues: ValidationIssue[];
  missingEnvVars: string[];
  warnings: string[];
  connection: ConnectionCheckResult | null;
};

export type ValidateConfigOptions = {
  cwd?: string;
  env?: Record<string, string | undefined>;
  checkConnections?: boolean;
  triggerDeployHook?: boolean;
};

function envRecordFromProcess(
  env: Record<string, string | undefined> | undefined,
): Record<string, string | undefined> {
  if (env) {
    return env;
  }

  return { ...process.env };
}

function addIssue(
  issues: ValidationIssue[],
  level: ValidationLevel,
  field: string,
  message: string,
): void {
  issues.push({ level, field, message });
}

export function validateConfig(options: ValidateConfigOptions = {}): ValidationReport {
  const cwd = options.cwd ?? process.cwd();
  const env = envRecordFromProcess(options.env);
  const configPath = resolveConfigPath(cwd);
  const envPath = resolve(cwd, ".env");
  const config = loadSourceDraftConfig(cwd);

  const adapter = config.adapter;
  const publisher = resolvePublisherId(config.publisher, env);
  const mediaProvider = resolveMediaProviderId(env);

  const issues: ValidationIssue[] = [];
  const warnings: string[] = [];

  if (!isAdapterId(adapter)) {
    addIssue(
      issues,
      "error",
      "adapter",
      `Unknown adapter "${adapter}". Valid: ${listAdapterIds().join(", ")}.`,
    );
  }

  if (!isPublisherId(publisher)) {
    addIssue(issues, "error", "publisher", `Unknown publisher "${publisher}".`);
  }

  if (!isMediaProviderId(mediaProvider)) {
    addIssue(
      issues,
      "error",
      "mediaProvider",
      `Unknown media provider "${mediaProvider}".`,
    );
  }

  if (!isValidRepoPath(config.contentDir)) {
    addIssue(
      issues,
      "error",
      "contentDir",
      `Content directory "${config.contentDir}" looks invalid. Use a relative path like src/content/blog.`,
    );
  }

  if (!isValidRepoPath(config.mediaDir)) {
    addIssue(
      issues,
      "error",
      "mediaDir",
      `Media directory "${config.mediaDir}" looks invalid. Use a relative path like public/images.`,
    );
  }

  if (!isValidPublicMediaPath(config.publicMediaPath)) {
    addIssue(
      issues,
      "warning",
      "publicMediaPath",
      `Public media path "${config.publicMediaPath}" should start with / (e.g. /images).`,
    );
  }

  if (config.categories.length === 0) {
    addIssue(issues, "warning", "categories", "No categories configured.");
  }

  const publisherReqs = publisherEnvRequirements(publisher);
  const mediaReqs = mediaProviderEnvRequirements(mediaProvider);
  const deployReqs =
    env.DEPLOY_HOOK_URL?.trim() ? deployHookEnvRequirements() : [];

  const missingPublisher = missingRequiredEnvVars(publisherReqs, env);
  const missingMedia = missingRequiredEnvVars(mediaReqs, env);
  const missingDeploy = missingRequiredEnvVars(deployReqs, env);

  for (const key of missingPublisher) {
    addIssue(issues, "error", key, `Missing required env var for publisher ${publisher}.`);
  }

  for (const key of missingMedia) {
    addIssue(issues, "error", key, `Missing required env var for media provider ${mediaProvider}.`);
  }

  for (const key of missingDeploy) {
    addIssue(issues, "error", key, "Missing required deploy hook env var.");
  }

  for (const message of validatePublisherSpecificRules(publisher, env)) {
    addIssue(issues, "error", "publisher", message);
  }

  if (isCmsPublisher(publisher) && mediaProvider === "github-media") {
    const msg =
      "CMS publisher with github-media: uploads use Git credentials; media library listing still reads from the git repo.";
    addIssue(issues, "warning", "compatibility", msg);
    warnings.push(msg);
  }

  if (isGitPublisher(publisher) && mediaProvider === "cloudinary") {
    const msg =
      "Git publisher with Cloudinary: article images may use Cloudinary URLs while the media library lists git files.";
    addIssue(issues, "warning", "compatibility", msg);
    warnings.push(msg);
  }

  if (mediaProvider === "s3-compatible") {
    const msg = "S3-compatible media provider is experimental — verify uploads before production use.";
    addIssue(issues, "warning", "mediaProvider", msg);
    warnings.push(msg);
  }

  if (publisher === "bitbucket") {
    const msg =
      "Bitbucket publisher supports publish and upload; listing posts in Studio may be limited.";
    addIssue(issues, "warning", "publisher", msg);
    warnings.push(msg);
  }

  if (configPath === null) {
    addIssue(
      issues,
      "warning",
      "config",
      "sourcedraft.config.json not found — using defaults. Run pnpm setup to create one.",
    );
  }

  if (!existsSync(envPath)) {
    addIssue(
      issues,
      "warning",
      "env",
      ".env not found — copy .env.example or run pnpm setup.",
    );
  }

  const missingEnvVars = [...missingPublisher, ...missingMedia, ...missingDeploy];
  const hasErrors = issues.some((issue) => issue.level === "error");

  const report: ValidationReport = {
    ok: !hasErrors,
    adapter,
    publisher,
    mediaProvider,
    configPath,
    envPath: existsSync(envPath) ? envPath : null,
    issues,
    missingEnvVars,
    warnings: [
      ...warnings,
      ...issues.filter((i) => i.level === "warning").map((i) => i.message),
    ],
    connection: null,
  };

  return report;
}

export async function validateConfigAsync(
  options: ValidateConfigOptions = {},
): Promise<ValidationReport> {
  const report = validateConfig(options);
  const env = envRecordFromProcess(options.env);
  const publisher = report.publisher;

  if (options.checkConnections) {
    report.connection = await checkPublisherConnection(publisher, env);
    if (report.connection && !report.connection.ok) {
      report.issues.push({
        level: "error",
        field: "connection",
        message: report.connection.detail,
      });
      report.ok = false;
    }
  }

  if (env.DEPLOY_HOOK_URL?.trim()) {
    const hookCheck = checkDeployHookUrlShape(env);
    if (!hookCheck.ok) {
      report.issues.push({
        level: "error",
        field: "DEPLOY_HOOK_URL",
        message: hookCheck.detail,
      });
      report.ok = false;
    } else if (!options.triggerDeployHook) {
      report.issues.push({
        level: "warning",
        field: "DEPLOY_HOOK_URL",
        message: hookCheck.detail,
      });
    }
  }

  return report;
}
