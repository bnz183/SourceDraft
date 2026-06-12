import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { formatEnvValueForDisplay } from "./maskSecrets.js";

export type EnvMap = Map<string, string>;

const ENV_KEY_PATTERN = /^[A-Z_][A-Z0-9_]*$/iu;

export function isValidEnvKey(key: string): boolean {
  return ENV_KEY_PATTERN.test(key);
}

function assertValidEnvKey(key: string): void {
  if (!isValidEnvKey(key)) {
    throw new Error(`Invalid env key: ${key}`);
  }
}

function needsQuoting(value: string): boolean {
  if (value.length === 0) {
    return true;
  }

  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (
      value[index] === " " ||
      value[index] === "#" ||
      value[index] === "=" ||
      value[index] === '"' ||
      value[index] === "\\" ||
      value[index] === "\n" ||
      value[index] === "\r" ||
      value[index] === "\t" ||
      code < 32
    ) {
      return true;
    }
  }

  return false;
}

export function escapeEnvValue(value: string): string {
  if (!needsQuoting(value)) {
    return value;
  }

  let escaped = "";
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const code = value.charCodeAt(index);

    if (char === "\\" || char === '"') {
      escaped += `\\${char}`;
      continue;
    }

    if (char === "\n") {
      escaped += "\\n";
      continue;
    }

    if (char === "\r") {
      escaped += "\\r";
      continue;
    }

    if (char === "\t") {
      escaped += "\\t";
      continue;
    }

    if (code < 32) {
      escaped += `\\u${code.toString(16).padStart(4, "0")}`;
      continue;
    }

    escaped += char;
  }

  return `"${escaped}"`;
}

function unescapeQuotedEnvValue(value: string): string {
  let unescaped = "";

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    if (char !== "\\" || index === value.length - 1) {
      unescaped += char;
      continue;
    }

    const next = value[index + 1];
    if (next === "n") {
      unescaped += "\n";
      index += 1;
      continue;
    }

    if (next === "r") {
      unescaped += "\r";
      index += 1;
      continue;
    }

    if (next === "t") {
      unescaped += "\t";
      index += 1;
      continue;
    }

    if (next === "u") {
      const hex = value.slice(index + 2, index + 6);
      if (/^[0-9a-fA-F]{4}$/u.test(hex)) {
        unescaped += String.fromCharCode(Number.parseInt(hex, 16));
        index += 5;
        continue;
      }
    }

    unescaped += next;
    index += 1;
  }

  return unescaped;
}

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

    if (value.startsWith('"') && value.endsWith('"')) {
      value = unescapeQuotedEnvValue(value.slice(1, -1));
    } else if (value.startsWith("'") && value.endsWith("'")) {
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
    assertValidEnvKey(key);
    lines.push(`${key}=${escapeEnvValue(value)}`);
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
