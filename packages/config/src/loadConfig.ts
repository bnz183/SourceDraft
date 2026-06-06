import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  DEFAULT_SOURCEDRAFT_CONFIG,
  type SourceDraftConfig,
} from "./types.js";

const CONFIG_FILENAME = "sourcedraft.config.json";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeCategories(value: unknown): string[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  const categories: string[] = [];
  for (const item of value) {
    if (!isNonEmptyString(item)) {
      return null;
    }
    categories.push(item.trim());
  }

  return categories.length > 0 ? categories : null;
}

export function normalizeSourceDraftConfig(
  raw: unknown,
): SourceDraftConfig {
  if (raw === null || typeof raw !== "object") {
    return DEFAULT_SOURCEDRAFT_CONFIG;
  }

  const input = raw as Record<string, unknown>;
  const categories = normalizeCategories(input.categories);

  return {
    adapter: isNonEmptyString(input.adapter)
      ? input.adapter.trim()
      : DEFAULT_SOURCEDRAFT_CONFIG.adapter,
    contentDir: isNonEmptyString(input.contentDir)
      ? input.contentDir.trim()
      : DEFAULT_SOURCEDRAFT_CONFIG.contentDir,
    mediaDir: isNonEmptyString(input.mediaDir)
      ? input.mediaDir.trim()
      : DEFAULT_SOURCEDRAFT_CONFIG.mediaDir,
    defaultBranch: isNonEmptyString(input.defaultBranch)
      ? input.defaultBranch.trim()
      : DEFAULT_SOURCEDRAFT_CONFIG.defaultBranch,
    categories: categories ?? DEFAULT_SOURCEDRAFT_CONFIG.categories,
  };
}

export function resolveConfigPath(cwd: string): string | null {
  const explicitPath = process.env.SOURCEDRAFT_CONFIG?.trim();
  if (explicitPath && existsSync(explicitPath)) {
    return explicitPath;
  }

  const candidates = [
    resolve(cwd, CONFIG_FILENAME),
    resolve(cwd, "../..", CONFIG_FILENAME),
    resolve(cwd, "../../..", CONFIG_FILENAME),
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

export function loadSourceDraftConfig(cwd = process.cwd()): SourceDraftConfig {
  const configPath = resolveConfigPath(cwd);
  if (configPath === null) {
    return DEFAULT_SOURCEDRAFT_CONFIG;
  }

  const raw = JSON.parse(readFileSync(configPath, "utf8")) as unknown;
  return normalizeSourceDraftConfig(raw);
}
