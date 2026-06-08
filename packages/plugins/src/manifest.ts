import type { SourceDraftPluginManifest, SourceDraftPluginModule } from "./types.js";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function validatePluginManifest(
  value: unknown,
): { ok: true; manifest: SourceDraftPluginManifest } | { ok: false; error: string } {
  if (value === null || typeof value !== "object") {
    return { ok: false, error: "Plugin manifest must be an object." };
  }

  const record = value as Record<string, unknown>;

  if (!isNonEmptyString(record.name)) {
    return { ok: false, error: "Plugin manifest requires a non-empty name." };
  }

  if (!isNonEmptyString(record.version)) {
    return { ok: false, error: "Plugin manifest requires a version string." };
  }

  if (!isNonEmptyString(record.requiresSourceDraft)) {
    return {
      ok: false,
      error: "Plugin manifest requires requiresSourceDraft (min SourceDraft version).",
    };
  }

  const manifest: SourceDraftPluginManifest = {
    name: record.name.trim(),
    version: record.version.trim(),
    requiresSourceDraft: record.requiresSourceDraft.trim(),
  };

  if (isNonEmptyString(record.description)) {
    manifest.description = record.description.trim();
  }

  return { ok: true, manifest };
}

export function extractPluginModule(
  imported: Record<string, unknown>,
): { ok: true; plugin: SourceDraftPluginModule } | { ok: false; error: string } {
  let candidate: Record<string, unknown> = imported;

  if (imported.plugin !== undefined && typeof imported.plugin === "object") {
    candidate = imported.plugin as Record<string, unknown>;
  } else if (imported.manifest !== undefined && typeof imported.manifest === "object") {
    candidate = {
      ...(imported.manifest as Record<string, unknown>),
      setup: imported.setup,
    };
  }

  const manifestResult = validatePluginManifest(candidate);
  if (!manifestResult.ok) {
    return manifestResult;
  }

  const setup = candidate.setup ?? imported.setup;
  if (typeof setup !== "function") {
    return { ok: false, error: "Plugin module must export a setup function." };
  }

  return {
    ok: true,
    plugin: {
      ...manifestResult.manifest,
      setup: setup as SourceDraftPluginModule["setup"],
    },
  };
}
