import { pathToFileURL } from "node:url";
import { collectPluginEntryPaths, resolvePluginEntryPath } from "./discover.js";
import { createPluginContext } from "./context.js";
import { extractPluginModule } from "./manifest.js";
import type { LoadPluginsOptions, PluginLoadFailure, PluginLoadReport } from "./types.js";
import { SOURCEDRAFT_VERSION, satisfiesSourceDraftVersion } from "./version.js";

function isPluginRequired(
  pluginName: string | null,
  sourceLabel: string,
  requiredNames: Set<string>,
): boolean {
  if (pluginName && requiredNames.has(pluginName)) {
    return true;
  }

  return requiredNames.has(sourceLabel);
}

async function loadPluginFromAbsolutePath(
  absolutePath: string,
  sourceLabel: string,
  requiredNames: Set<string>,
  sourceDraftVersion: string,
): Promise<{ loadedName: string } | PluginLoadFailure> {
  let imported: Record<string, unknown>;
  try {
    const mod = await import(pathToFileURL(absolutePath).href);
    imported = mod as Record<string, unknown>;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Plugin import failed.";
    return {
      path: sourceLabel,
      name: null,
      error: message,
      required: isPluginRequired(null, sourceLabel, requiredNames),
    };
  }

  const extracted = extractPluginModule(imported);
  if (!extracted.ok) {
    return {
      path: sourceLabel,
      name: null,
      error: extracted.error,
      required: isPluginRequired(null, sourceLabel, requiredNames),
    };
  }

  const { plugin } = extracted;
  const required = isPluginRequired(plugin.name, sourceLabel, requiredNames);

  if (!satisfiesSourceDraftVersion(plugin.requiresSourceDraft, sourceDraftVersion)) {
    return {
      path: sourceLabel,
      name: plugin.name,
      error: `Plugin requires SourceDraft ${plugin.requiresSourceDraft} but running ${sourceDraftVersion}.`,
      required,
    };
  }

  const context = createPluginContext(plugin.name);

  try {
    await plugin.setup(context);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Plugin setup failed.";
    return {
      path: sourceLabel,
      name: plugin.name,
      error: message,
      required,
    };
  }

  return { loadedName: plugin.name };
}

export async function loadPlugins(options: LoadPluginsOptions): Promise<PluginLoadReport> {
  const sourceDraftVersion = options.sourceDraftVersion ?? SOURCEDRAFT_VERSION;
  const requiredNames = new Set(options.requiredPlugins ?? []);
  const entries = collectPluginEntryPaths({
    configDir: options.configDir,
    ...(options.plugins !== undefined ? { plugins: options.plugins } : {}),
    ...(options.discoverPlugins !== undefined
      ? { discoverPlugins: options.discoverPlugins }
      : {}),
  });

  const loaded: string[] = [];
  const failures: PluginLoadFailure[] = [];

  for (const entry of entries) {
    const resolved = resolvePluginEntryPath(options.configDir, entry.source);
    if (!resolved.ok) {
      failures.push({
        path: entry.source,
        name: null,
        error: resolved.error,
        required: isPluginRequired(null, entry.source, requiredNames),
      });
      continue;
    }

    const result = await loadPluginFromAbsolutePath(
      resolved.path,
      entry.source,
      requiredNames,
      sourceDraftVersion,
    );

    if ("loadedName" in result) {
      loaded.push(result.loadedName);
    } else {
      failures.push(result);
    }
  }

  const ok = failures.every((failure) => !failure.required);

  return { ok, loaded, failures };
}

export async function loadPluginsOrThrow(options: LoadPluginsOptions): Promise<PluginLoadReport> {
  const report = await loadPlugins(options);
  if (!report.ok) {
    const summary = report.failures
      .filter((failure) => failure.required)
      .map((failure) => `${failure.name ?? failure.path}: ${failure.error}`)
      .join("; ");
    throw new Error(`Required plugin(s) failed to load: ${summary}`);
  }

  return report;
}
