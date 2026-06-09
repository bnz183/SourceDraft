import { bitbucketPublisherFactory } from "./bitbucketPublisherAdapter.js";
import { ghostPublisherFactory } from "./ghostPublisherAdapter.js";
import { githubPublisherFactory } from "./githubPublisherAdapter.js";
import { gitlabPublisherFactory } from "./gitlabPublisherAdapter.js";
import { registerPublisher } from "./publisherRegistry.js";
import { wordpressPublisherFactory } from "./wordpressPublisherAdapter.js";

export function registerBuiltInPublishers(): void {
  registerPublisher(githubPublisherFactory);
  registerPublisher(gitlabPublisherFactory);
  registerPublisher(bitbucketPublisherFactory);
  registerPublisher(wordpressPublisherFactory);
  registerPublisher(ghostPublisherFactory);
}

registerBuiltInPublishers();
