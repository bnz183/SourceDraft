import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  buildSuggestedConfigSnippet,
  detectSetup,
  isSafeToApplySuggestion,
  type SetupDetectionResult,
} from "@sourcedraft/setup";

export type SetupDetectionResponse = SetupDetectionResult & {
  safeToApply: boolean;
  suggestedConfigSnippet: string | null;
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

export function runSetupDetection(): SetupDetectionResponse {
  const result = detectSetup(resolveDetectionRoot());
  const primary = result.primary;

  return {
    ...result,
    safeToApply: primary !== null && isSafeToApplySuggestion(primary),
    suggestedConfigSnippet:
      primary !== null ? buildSuggestedConfigSnippet(primary) : null,
  };
}
