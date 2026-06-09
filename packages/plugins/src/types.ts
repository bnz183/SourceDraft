import type { Adapter } from "@sourcedraft/adapters";
import type { MediaProviderFactory } from "@sourcedraft/media-providers";
import type { PublisherFactory } from "@sourcedraft/publishers";

export type PluginLogger = {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
};

export type PluginContext = {
  registerAdapter: (adapter: Adapter) => void;
  registerPublisher: (factory: PublisherFactory) => void;
  registerMediaProvider: (factory: MediaProviderFactory) => void;
  logger: PluginLogger;
};

export type SourceDraftPluginManifest = {
  name: string;
  version: string;
  requiresSourceDraft: string;
  description?: string;
};

export type SourceDraftPluginModule = SourceDraftPluginManifest & {
  setup: (context: PluginContext) => void | Promise<void>;
};

export type PluginLoadFailure = {
  path: string;
  name: string | null;
  error: string;
  required: boolean;
};

export type PluginLoadReport = {
  ok: boolean;
  loaded: string[];
  failures: PluginLoadFailure[];
};

export type LoadPluginsOptions = {
  configDir: string;
  plugins?: string[];
  requiredPlugins?: string[];
  discoverPlugins?: boolean;
  sourceDraftVersion?: string;
};
