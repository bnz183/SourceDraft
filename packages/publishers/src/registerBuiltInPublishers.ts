import { bitbucketPublisherFactory } from "./bitbucketPublisherAdapter.js";
import { githubPublisherFactory } from "./githubPublisherAdapter.js";
import { gitlabPublisherFactory } from "./gitlabPublisherAdapter.js";
import { registerPublisher } from "./publisherRegistry.js";

export function registerBuiltInPublishers(): void {
  registerPublisher(githubPublisherFactory);
  registerPublisher(gitlabPublisherFactory);
  registerPublisher(bitbucketPublisherFactory);
}

registerBuiltInPublishers();
