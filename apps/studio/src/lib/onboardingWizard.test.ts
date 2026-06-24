import assert from "node:assert/strict";
import { test } from "node:test";
import type { PostSummary } from "./posts.js";
import type { SetupDetectionReport } from "./setupDetection.js";
import {
  createTestDraftDefaults,
  dashboardNextActions,
  detectionChoices,
  nextOnboardingStep,
  onboardingStepLabel,
  pickDetectionSuggestion,
  previousOnboardingStep,
  shouldShowOnboarding,
  summarizePostsForDashboard,
} from "./onboardingWizard.js";

const posts: PostSummary[] = [
  {
    path: "src/content/blog/a.mdx",
    title: "Alpha",
    slug: "alpha",
    pubDate: "2026-01-02",
    category: "Guides",
    draft: false,
  },
  {
    path: "src/content/blog/b.mdx",
    title: "Beta",
    slug: "beta",
    pubDate: "2026-01-01",
    category: "Guides",
    draft: true,
  },
];

test("shouldShowOnboarding skips demo mode and completed users", () => {
  assert.equal(shouldShowOnboarding({ demoMode: true, complete: false }), false);
  assert.equal(shouldShowOnboarding({ demoMode: false, complete: true }), false);
  assert.equal(shouldShowOnboarding({ demoMode: false, complete: false }), true);
});

test("onboarding step navigation moves forward and back", () => {
  assert.equal(nextOnboardingStep("welcome"), "detect-site");
  assert.equal(previousOnboardingStep("detect-site"), "welcome");
  assert.equal(nextOnboardingStep("open-editor"), null);
});

test("onboardingStepLabel returns plain labels", () => {
  assert.equal(onboardingStepLabel("confirm-content"), "Articles folder");
  assert.equal(onboardingStepLabel("open-editor"), "Start writing");
});

test("summarizePostsForDashboard counts drafts and sorts recent posts", () => {
  const stats = summarizePostsForDashboard(posts);
  assert.equal(stats.total, 2);
  assert.equal(stats.published, 1);
  assert.equal(stats.drafts, 1);
  assert.equal(stats.recent[0]?.title, "Alpha");
});

test("pickDetectionSuggestion honors selected adapter", () => {
  const report: SetupDetectionReport = {
    scannedRoot: "/repo",
    detected: true,
    primary: {
      framework: "Astro",
      adapter: "astro-mdx",
      contentDir: "src/content/blog",
      contentRoot: "src/content/blog",
      contentRootCandidates: [],
      postFileCount: 1,
      mediaDir: "src/assets/images",
      publicMediaPath: "/images",
      defaultBranch: "main",
      confidence: 90,
      explanation: "Astro markers",
      warnings: [],
      frontmatter: null,
    },
    alternatives: [
      {
        framework: "Next.js",
        adapter: "nextjs-mdx",
        contentDir: "content/posts",
        contentRoot: "content/posts",
        contentRootCandidates: [],
        postFileCount: 0,
        mediaDir: "public/images",
        publicMediaPath: "/images",
        defaultBranch: "main",
        confidence: 40,
        explanation: "Next.js markers",
        warnings: [],
        frontmatter: null,
      },
    ],
    warnings: [],
    onboardingMessage: null,
    failureMessage: null,
    safeToApply: true,
    suggestedConfigSnippet: null,
    configExists: false,
    configPreviewSummary: null,
  };

  assert.equal(
    pickDetectionSuggestion(report, "nextjs-mdx")?.framework,
    "Next.js",
  );
});

test("detectionChoices deduplicates adapter ids", () => {
  const report: SetupDetectionReport = {
    scannedRoot: "/repo",
    detected: true,
    primary: {
      framework: "Astro",
      adapter: "astro-mdx",
      contentDir: "src/content/blog",
      contentRoot: "src/content/blog",
      contentRootCandidates: [],
      postFileCount: 1,
      mediaDir: "src/assets/images",
      publicMediaPath: "/images",
      defaultBranch: "main",
      confidence: 90,
      explanation: "Astro markers",
      warnings: [],
      frontmatter: null,
    },
    alternatives: [
      {
        framework: "Astro",
        adapter: "astro-mdx",
        contentDir: "src/content/blog",
        contentRoot: "src/content/blog",
        contentRootCandidates: [],
        postFileCount: 1,
        mediaDir: "src/assets/images",
        publicMediaPath: "/images",
        defaultBranch: "main",
        confidence: 80,
        explanation: "Duplicate",
        warnings: [],
        frontmatter: null,
      },
    ],
    warnings: [],
    onboardingMessage: null,
    failureMessage: null,
    safeToApply: true,
    suggestedConfigSnippet: null,
    configExists: false,
    configPreviewSummary: null,
  };

  assert.equal(detectionChoices(report).length, 1);
});

test("createTestDraftDefaults returns a draft starter", () => {
  const draft = createTestDraftDefaults("Guides");
  assert.equal(draft.draft, true);
  assert.equal(draft.category, "Guides");
  assert.match(draft.title, /first SourceDraft article/);
});

test("dashboardNextActions prioritizes setup and connection", () => {
  const actions = dashboardNextActions({
    demoMode: false,
    githubReady: false,
    setupReady: false,
    setupNextAction: "Add a GitHub token in .env",
    postStats: summarizePostsForDashboard([]),
    detectionComplete: false,
  });

  assert.equal(actions[0]?.id, "finish-setup");
  assert.equal(actions[0]?.target, "setup-wizard");
  assert.ok(actions.some((action) => action.id === "connect-blog"));
  assert.equal(
    actions.find((action) => action.id === "connect-blog")?.target,
    "settings-readiness",
  );
});

test("dashboardNextActions suggests writing in demo mode", () => {
  const actions = dashboardNextActions({
    demoMode: true,
    githubReady: false,
    setupReady: false,
    setupNextAction: null,
    postStats: summarizePostsForDashboard(posts),
    detectionComplete: true,
  });

  assert.equal(actions[0]?.id, "demo-write");
  assert.equal(actions[0]?.target, "posts");
});
