import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { DEFAULT_SOURCEDRAFT_CATEGORIES } from "@sourcedraft/config";
import type { SetupDetectionSuggestion } from "./detectSetup.js";
import { buildConfigWriteSummary } from "./onboardingCopy.js";

export type GenerateConfigSuccess = {
  ok: true;
  configPath: string;
  summary: string;
  config: Record<string, unknown>;
};

export type GenerateConfigFailure = {
  ok: false;
  code: "exists" | "no-suggestion" | "write-failed";
  error: string;
};

export type GenerateConfigResult = GenerateConfigSuccess | GenerateConfigFailure;

export function buildConfigFromSuggestion(
  suggestion: SetupDetectionSuggestion,
): Record<string, unknown> {
  const categories =
    suggestion.frontmatter?.suggestedCategories &&
    suggestion.frontmatter.suggestedCategories.length > 0
      ? suggestion.frontmatter.suggestedCategories
      : [...DEFAULT_SOURCEDRAFT_CATEGORIES];

  return {
    adapter: suggestion.adapter,
    publisher: "github",
    contentDir: suggestion.contentDir,
    mediaDir: suggestion.mediaDir,
    publicMediaPath: suggestion.publicMediaPath,
    defaultBranch: suggestion.defaultBranch,
    categories,
    adapterOptions: {},
    publisherOptions: {},
  };
}

export function generateConfigFromDetection(
  cwd: string,
  suggestion: SetupDetectionSuggestion | null,
): GenerateConfigResult {
  if (suggestion === null) {
    return {
      ok: false,
      code: "no-suggestion",
      error:
        "No framework suggestion is available. Run detection on a supported project or configure sourcedraft.config.json manually.",
    };
  }

  const configPath = resolve(cwd, "sourcedraft.config.json");
  if (existsSync(configPath)) {
    return {
      ok: false,
      code: "exists",
      error:
        "sourcedraft.config.json already exists. Edit it manually or remove it before generating a new file.",
    };
  }

  const config = buildConfigFromSuggestion(suggestion);
  const summary = buildConfigWriteSummary(configPath, config);

  try {
    writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`, "utf8");
  } catch (error) {
    return {
      ok: false,
      code: "write-failed",
      error:
        error instanceof Error
          ? error.message
          : "Could not write sourcedraft.config.json.",
    };
  }

  return {
    ok: true,
    configPath,
    summary,
    config,
  };
}
