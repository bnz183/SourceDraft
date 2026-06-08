import { dirname } from "node:path";
import { loadSourceDraftConfig, resolveConfigPath } from "@sourcedraft/config";
import { loadPlugins } from "@sourcedraft/plugins";

export async function initializePlugins(cwd = process.cwd()): Promise<void> {
  const config = loadSourceDraftConfig(cwd);
  const configPath = resolveConfigPath(cwd);
  const configDir = configPath ? dirname(configPath) : cwd;

  const hasExplicitPlugins = (config.plugins?.length ?? 0) > 0;
  const discover = config.discoverPlugins === true;

  if (!hasExplicitPlugins && !discover) {
    return;
  }

  const report = await loadPlugins({
    configDir,
    ...(config.plugins !== undefined ? { plugins: config.plugins } : {}),
    ...(config.requiredPlugins !== undefined
      ? { requiredPlugins: config.requiredPlugins }
      : {}),
    ...(discover ? { discoverPlugins: true } : {}),
  });

  for (const failure of report.failures) {
    const label = failure.name ?? failure.path;
    if (failure.required) {
      console.error(`[plugins] Required plugin failed (${label}): ${failure.error}`);
    } else {
      console.warn(`[plugins] Optional plugin skipped (${label}): ${failure.error}`);
    }
  }

  if (!report.ok) {
    const summary = report.failures
      .filter((failure) => failure.required)
      .map((failure) => `${failure.name ?? failure.path}: ${failure.error}`)
      .join("; ");
    throw new Error(`Required plugin(s) failed to load: ${summary}`);
  }

  if (report.loaded.length > 0) {
    console.log(`[plugins] Loaded: ${report.loaded.join(", ")}`);
  }
}
