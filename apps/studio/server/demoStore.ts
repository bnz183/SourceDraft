import { loadDemoMediaFixtures, loadDemoPostFixtures } from "./demo/loadFixtures.js";
import type { DemoFixtureMedia, DemoFixturePost } from "./demo/types.js";
import type { PostSummary } from "./posts.js";
import type { MediaFileSummary } from "./listMedia.js";

type StoredPost = DemoFixturePost;

let posts = new Map<string, StoredPost>();
let media: DemoFixtureMedia[] = [];

function loadPostsFromFixtures(): Map<string, StoredPost> {
  const next = new Map<string, StoredPost>();
  for (const fixture of loadDemoPostFixtures()) {
    next.set(fixture.summary.path, fixture);
  }
  return next;
}

export function resetDemoStore(): void {
  posts = loadPostsFromFixtures();
  media = loadDemoMediaFixtures();
}

resetDemoStore();

export function listDemoPosts(): PostSummary[] {
  return [...posts.values()]
    .map((entry) => ({ ...entry.summary }))
    .sort((left, right) => right.pubDate.localeCompare(left.pubDate));
}

export function getDemoPost(path: string): StoredPost | null {
  return posts.get(path) ?? null;
}

export function upsertDemoPost(path: string, content: string, summary: PostSummary): void {
  posts.set(path, {
    summary: { ...summary },
    content,
  });
}

export function listDemoMedia(): MediaFileSummary[] {
  return media.map((file) => ({ ...file }));
}

export function addDemoMedia(file: MediaFileSummary): void {
  media = [file, ...media.filter((entry) => entry.repoPath !== file.repoPath)];
}

export function demoCommitSha(): string {
  return `demo${Date.now().toString(16).slice(-7)}`;
}
