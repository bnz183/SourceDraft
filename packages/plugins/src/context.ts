import { registerAdapter } from "@sourcedraft/adapters";
import { registerMediaProvider } from "@sourcedraft/media-providers";
import { registerPublisher } from "@sourcedraft/publishers";
import { createPluginLogger } from "./logger.js";
import type { PluginContext } from "./types.js";

export function createPluginContext(pluginName: string): PluginContext {
  const logger = createPluginLogger(pluginName);

  return {
    registerAdapter(adapter) {
      logger.info(`Registered adapter "${adapter.id}".`);
      registerAdapter(adapter);
    },
    registerPublisher(factory) {
      logger.info(`Registered publisher "${factory.id}".`);
      registerPublisher(factory);
    },
    registerMediaProvider(factory) {
      logger.info(`Registered media provider "${factory.id}".`);
      registerMediaProvider(factory);
    },
    logger,
  };
}
