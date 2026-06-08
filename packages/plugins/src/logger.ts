import type { PluginLogger } from "./types.js";

export function createPluginLogger(pluginName: string): PluginLogger {
  const prefix = `[plugin:${pluginName}]`;

  return {
    info(message: string) {
      console.log(`${prefix} ${message}`);
    },
    warn(message: string) {
      console.warn(`${prefix} ${message}`);
    },
    error(message: string) {
      console.error(`${prefix} ${message}`);
    },
  };
}
