import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { formatEnvValueForDisplay } from "./maskSecrets.js";

export type EnvMap = Map<string, string>;

export function parseEnvFile(content: string): EnvMap {
  const map: EnvMap = new Map();

  for (const line of content.split(/\r?\n/u)) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) {
      continue;
    }

    const eq = trimmed.indexOf("=");
    if (eq <= 0) {
      continue;
    }

    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    map.set(key, value);
  }

  return map;
}

export function loadEnvMap(envPath: string): EnvMap {
  if (!existsSync(envPath)) {
    return new Map();
  }

  return parseEnvFile(readFileSync(envPath, "utf8"));
}

export function serializeEnvFile(map: EnvMap, header?: string): string {
  const lines: string[] = [];

  if (header) {
    lines.push(header.trimEnd(), "");
  }

  for (const [key, value] of [...map.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const escaped =
      value.includes(" ") || value.includes("#") ? `"${value.replace(/"/gu, '\\"')}"` : value;
    lines.push(`${key}=${escaped}`);
  }

  lines.push("");
  return lines.join("\n");
}

export function backupEnvFile(envPath: string, now = new Date()): string | null {
  if (!existsSync(envPath)) {
    return null;
  }

  const stamp = now.toISOString().replace(/[:.]/gu, "-");
  const backupPath = resolve(`${envPath}.backup.${stamp}`);
  copyFileSync(envPath, backupPath);
  return backupPath;
}

export type EnvMergeDecision = "set" | "skip" | "keep";

export function mergeEnvMaps(
  existing: EnvMap,
  updates: EnvMap,
  shouldOverwrite: (key: string, existingValue: string) => EnvMergeDecision,
): EnvMap {
  const merged = new Map(existing);

  for (const [key, value] of updates.entries()) {
    if (value.trim().length === 0) {
      continue;
    }

    const current = merged.get(key);
    if (current !== undefined && current.trim().length > 0) {
      const decision = shouldOverwrite(key, current);
      if (decision !== "set") {
        continue;
      }
    }

    merged.set(key, value);
  }

  return merged;
}

export function summarizeEnvUpdates(updates: EnvMap): string[] {
  return [...updates.entries()]
    .filter(([, value]) => value.trim().length > 0)
    .map(([key, value]) => `  ${key}=${formatEnvValueForDisplay(key, value)}`);
}
