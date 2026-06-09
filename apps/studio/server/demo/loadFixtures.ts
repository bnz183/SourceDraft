import type { DemoFixtureMedia, DemoFixturePost } from "./types.js";
import { DEMO_MEDIA_FIXTURES } from "./fixtures/media.js";
import { DEMO_POST_FIXTURES } from "./fixtures/posts.js";

function clonePost(fixture: DemoFixturePost): DemoFixturePost {
  return {
    summary: { ...fixture.summary },
    content: fixture.content,
  };
}

function cloneMedia(fixture: DemoFixtureMedia): DemoFixtureMedia {
  return { ...fixture };
}

export function loadDemoPostFixtures(): DemoFixturePost[] {
  return DEMO_POST_FIXTURES.map(clonePost);
}

export function loadDemoMediaFixtures(): DemoFixtureMedia[] {
  return DEMO_MEDIA_FIXTURES.map(cloneMedia);
}

export function demoFixturePostCount(): number {
  return DEMO_POST_FIXTURES.length;
}

export function demoFixtureMediaCount(): number {
  return DEMO_MEDIA_FIXTURES.length;
}
