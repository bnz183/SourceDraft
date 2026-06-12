import { resolve } from "node:path";
import { generateConfigFromDetection } from "@sourcedraft/setup";
import { resolveSetupDetectionRoot, runSetupDetection } from "./setupDetection.js";

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

export function runGenerateConfig(): GenerateConfigResponse {
  const detection = runSetupDetection();
  const root = resolveSetupDetectionRoot();
  const result = generateConfigFromDetection(root, detection.primary);

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
