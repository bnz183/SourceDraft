import type {
  MediaProvider,
  MediaProviderFactory,
  MediaProviderId,
  MediaProviderRuntimeConfig,
} from "./types.js";

const providers = new Map<MediaProviderId, MediaProviderFactory>();

export function registerMediaProvider(factory: MediaProviderFactory): void {
  providers.set(factory.id, factory);
}

export function listMediaProviderIds(): MediaProviderId[] {
  return [...providers.keys()];
}

export function isMediaProviderId(value: string): value is MediaProviderId {
  return providers.has(value as MediaProviderId);
}

export function getMediaProviderFactory(id: MediaProviderId): MediaProviderFactory {
  const factory = providers.get(id);
  if (factory === undefined) {
    throw new Error(`Media provider "${id}" is not registered.`);
  }

  return factory;
}

export function createMediaProvider(
  id: MediaProviderId,
  config: MediaProviderRuntimeConfig,
): MediaProvider {
  return getMediaProviderFactory(id).createProvider(config);
}

export function supportedMediaProviderSummary(): string {
  return listMediaProviderIds().join(", ");
}

export const mediaProviderRegistry = {
  register: registerMediaProvider,
  listIds: listMediaProviderIds,
  isKnown: isMediaProviderId,
  getFactory: getMediaProviderFactory,
  create: createMediaProvider,
  supportedSummary: supportedMediaProviderSummary,
};
