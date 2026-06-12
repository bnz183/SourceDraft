import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildConfigFromSuggestion,
  buildConfigWriteSummary,
  buildSuggestedConfigSnippet,
  detectSetup,
  isSafeToApplySuggestion,
  type SetupDetectionResult,
} from "@sourcedraft/setup";

export type SetupDetectionResponse = SetupDetectionResult & {
  safeToApply: boolean;
  suggestedConfigSnippet: string | null;
  configExists: boolean;
  configPreviewSummary: string | null;
};

function resolveDetectionRoot(): string {
  const explicit =
    process.env.SOURCEDRAFT_REPO_ROOT?.trim() ||
    process.env.CMS_REPO_ROOT?.trim();

  if (explicit && existsSync(explicit)) {
    return resolve(explicit);
  }

  let dir = process.cwd();
  for (let depth = 0; depth < 6; depth += 1) {
    if (
      existsSync(resolve(dir, "sourcedraft.config.json")) ||
      existsSync(resolve(dir, "package.json")) ||
      existsSync(resolve(dir, "astro.config.mjs")) ||
      existsSync(resolve(dir, "mkdocs.yml")) ||
      existsSync(resolve(dir, "hugo.toml"))
    ) {
      return dir;
    }

    const parent = resolve(dir, "..");
    if (parent === dir) {
      break;
    }

    dir = parent;
  }

  return process.cwd();
}

export function resolveSetupDetectionRoot(): string {
  return resolveDetectionRoot();
}

export function runSetupDetection(): SetupDetectionResponse {
  const scannedRoot = resolveDetectionRoot();
  const result = detectSetup(scannedRoot);
  const primary = result.primary;
  const configPath = resolve(scannedRoot, "sourcedraft.config.json");
  const configExists = existsSync(configPath);
  const configPreview =
    primary !== null
      ? buildConfigFromSuggestion(primary)
      : null;

  return {
    ...result,
    safeToApply: primary !== null && isSafeToApplySuggestion(primary),
    suggestedConfigSnippet:
      primary !== null ? buildSuggestedConfigSnippet(primary) : null,
    configExists,
    configPreviewSummary:
      configPreview !== null
        ? buildConfigWriteSummary(configPath, configPreview)
        : null,
  };
}
