import { resolve } from "node:path";
import {
  generateConfigFromDetection,
  resolveDetectionSuggestion,
} from "@sourcedraft/setup";
import { resolveSetupDetectionRoot, runSetupDetection } from "./setupDetection.js";

export type GenerateConfigInput = {
  adapter?: string;
  contentRoot?: string;
};

export type GenerateConfigResponse =
  | {
      ok: true;
      configPath: string;
      summary: string;
    }
  | {
      ok: false;
      code: string;
      error: string;
    };

export function runGenerateConfig(input?: GenerateConfigInput): GenerateConfigResponse {
  const detection = runSetupDetection();
  const root = resolveSetupDetectionRoot();
  const suggestion = resolveDetectionSuggestion(detection, {
    adapter: input?.adapter ?? null,
    contentRoot: input?.contentRoot ?? null,
  });
  const result = generateConfigFromDetection(root, suggestion);

  if (!result.ok) {
    return {
      ok: false,
      code: result.code,
      error: result.error,
    };
  }

  return {
    ok: true,
    configPath: result.configPath,
    summary: result.summary,
  };
}

export function resolveGeneratedConfigPath(): string {
  return resolve(resolveSetupDetectionRoot(), "sourcedraft.config.json");
}
