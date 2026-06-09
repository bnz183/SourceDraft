import type { DemoFixtureMedia } from "../types.js";
import { DEMO_MEDIA_DIR, DEMO_PUBLIC_MEDIA_PATH } from "./constants.js";

/**
 * Stable seed media metadata for demo mode. No binary files are stored in the repo;
 * uploads during a session append in-memory entries with simulated public paths.
 */
export const DEMO_MEDIA_FIXTURES: DemoFixtureMedia[] = [
  {
    repoPath: `${DEMO_MEDIA_DIR}/sample-cover.png`,
    publicPath: `${DEMO_PUBLIC_MEDIA_PATH}/sample-cover.png`,
    filename: "sample-cover.png",
    extension: "png",
    kind: "image",
    size: 48_000,
  },
  {
    repoPath: `${DEMO_MEDIA_DIR}/workflow-diagram.png`,
    publicPath: `${DEMO_PUBLIC_MEDIA_PATH}/workflow-diagram.png`,
    filename: "workflow-diagram.png",
    extension: "png",
    kind: "image",
    size: 72_500,
  },
  {
    repoPath: `${DEMO_MEDIA_DIR}/sample-handbook.pdf`,
    publicPath: `${DEMO_PUBLIC_MEDIA_PATH}/sample-handbook.pdf`,
    filename: "sample-handbook.pdf",
    extension: "pdf",
    kind: "pdf",
    size: 128_000,
  },
];
