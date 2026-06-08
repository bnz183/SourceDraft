import { existsSync, readdirSync } from "node:fs";
import { extname, resolve } from "node:path";

const ALLOWED_EXTENSIONS = new Set([".js", ".mjs", ".cjs"]);

export function isPathInsideRoot(rootDir: string, candidatePath: string): boolean {
  const root = resolve(rootDir);
  const candidate = resolve(candidatePath);
  return candidate === root || candidate.startsWith(`${root}/`);
}

export function resolvePluginEntryPath(
  configDir: string,
  pluginPath: string,
): { ok: true; path: string } | { ok: false; error: string } {
  const trimmed = pluginPath.trim();
  if (trimmed.length === 0) {
    return { ok: false, error: "Plugin path is empty." };
  }

  if (trimmed.includes("\0")) {
    return { ok: false, error: "Plugin path is invalid." };
  }

  const resolved = resolve(configDir, trimmed);
  if (!isPathInsideRoot(configDir, resolved)) {
    return { ok: false, error: `Plugin path escapes config directory: ${pluginPath}` };
  }

  if (!existsSync(resolved)) {
    return { ok: false, error: `Plugin file not found: ${pluginPath}` };
  }

  return { ok: true, path: resolved };
}

export function discoverLocalPluginPaths(configDir: string): string[] {
  const pluginsDir = resolve(configDir, "plugins");
  if (!existsSync(pluginsDir)) {
    return [];
  }

  const paths: string[] = [];

  for (const entry of readdirSync(pluginsDir, { withFileTypes: true })) {
    if (!entry.isFile()) {
      continue;
    }

    const extension = extname(entry.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      continue;
    }

    if (entry.name.startsWith(".")) {
      continue;
    }

    paths.push(`plugins/${entry.name}`);
  }

  return paths.sort();
}

export function collectPluginEntryPaths(options: {
  configDir: string;
  plugins?: string[];
  discoverPlugins?: boolean;
}): Array<{ path: string; source: string }> {
  const entries: Array<{ path: string; source: string }> = [];
  const seen = new Set<string>();

  for (const pluginPath of options.plugins ?? []) {
    const resolved = resolvePluginEntryPath(options.configDir, pluginPath);
    const key = resolved.ok ? resolved.path : pluginPath;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    entries.push({ path: resolved.ok ? resolved.path : pluginPath, source: pluginPath });
  }

  if (options.discoverPlugins === true) {
    for (const discoveredPath of discoverLocalPluginPaths(options.configDir)) {
      const resolved = resolvePluginEntryPath(options.configDir, discoveredPath);
      const key = resolved.ok ? resolved.path : discoveredPath;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      entries.push({
        path: resolved.ok ? resolved.path : discoveredPath,
        source: discoveredPath,
      });
    }
  }

  return entries;
}
