export { createPluginContext } from "./context.js";
export { createPluginLogger } from "./logger.js";
export {
  collectPluginEntryPaths,
  discoverLocalPluginPaths,
  isPathInsideRoot,
  resolvePluginEntryPath,
} from "./discover.js";
export { extractPluginModule, validatePluginManifest } from "./manifest.js";
export { loadPlugins, loadPluginsOrThrow } from "./loader.js";
export {
  SOURCEDRAFT_VERSION,
  parseVersion,
  satisfiesSourceDraftVersion,
} from "./version.js";

export type {
  LoadPluginsOptions,
  PluginContext,
  PluginLoadFailure,
  PluginLoadReport,
  PluginLogger,
  SourceDraftPluginManifest,
  SourceDraftPluginModule,
} from "./types.js";
