import { githubPublisherFactory } from "./githubPublisherAdapter.js";
import { registerPublisher } from "./publisherRegistry.js";

export function registerBuiltInPublishers(): void {
  registerPublisher(githubPublisherFactory);
}

registerBuiltInPublishers();
