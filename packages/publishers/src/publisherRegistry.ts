import type {
  Publisher,
  PublisherFactory,
  PublisherId,
  PublisherRuntimeConfig,
} from "./types.js";

const publishers = new Map<PublisherId, PublisherFactory>();

export function registerPublisher(factory: PublisherFactory): void {
  publishers.set(factory.id, factory);
}

export function listPublisherIds(): PublisherId[] {
  return [...publishers.keys()];
}

export function isPublisherId(value: string): value is PublisherId {
  return publishers.has(value as PublisherId);
}

export function getPublisherFactory(publisherId: PublisherId): PublisherFactory {
  const factory = publishers.get(publisherId);
  if (factory === undefined) {
    throw new Error(`Publisher "${publisherId}" is not registered.`);
  }

  return factory;
}

export function createPublisher(
  publisherId: PublisherId,
  config: PublisherRuntimeConfig,
): Publisher {
  return getPublisherFactory(publisherId).createPublisher(config);
}

export function supportedPublisherSummary(): string {
  return listPublisherIds().join(", ");
}

export const publisherRegistry = {
  register: registerPublisher,
  listIds: listPublisherIds,
  isKnown: isPublisherId,
  getFactory: getPublisherFactory,
  create: createPublisher,
  supportedSummary: supportedPublisherSummary,
};
