import type { PostSummary } from "../posts.js";

export type DemoFixturePost = {
  summary: PostSummary;
  content: string;
};

export type DemoFixtureMedia = {
  repoPath: string;
  publicPath: string;
  filename: string;
  extension: string;
  kind: "image" | "pdf";
  size: number;
};
