import type { PostSummary } from "./posts.js";
import type { SetupDetectionReport, SetupDetectionSuggestion } from "./setupDetection.js";

export const ONBOARDING_COMPLETE_KEY = "sourcedraft-onboarding-complete";

export const ONBOARDING_STEP_ORDER = [
  "welcome",
  "detect-site",
  "confirm-content",
  "confirm-schema",
  "confirm-media",
  "create-draft",
  "open-editor",
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEP_ORDER)[number];

export type DashboardPostStats = {
  total: number;
  published: number;
  drafts: number;
  recent: PostSummary[];
};

export function isOnboardingComplete(): boolean {
  if (typeof localStorage === "undefined") {
    return false;
  }

  return localStorage.getItem(ONBOARDING_COMPLETE_KEY) === "true";
}

export function markOnboardingComplete(): void {
  localStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
}

export function shouldShowOnboarding(options: {
  demoMode: boolean;
  complete: boolean;
}): boolean {
  if (options.demoMode) {
    return false;
  }

  return !options.complete;
}

export function stepIndex(step: OnboardingStepId): number {
  return ONBOARDING_STEP_ORDER.indexOf(step);
}

export function nextOnboardingStep(
  step: OnboardingStepId,
): OnboardingStepId | null {
  const index = stepIndex(step);
  if (index < 0 || index >= ONBOARDING_STEP_ORDER.length - 1) {
    return null;
  }

  return ONBOARDING_STEP_ORDER[index + 1] ?? null;
}

export function previousOnboardingStep(
  step: OnboardingStepId,
): OnboardingStepId | null {
  const index = stepIndex(step);
  if (index <= 0) {
    return null;
  }

  return ONBOARDING_STEP_ORDER[index - 1] ?? null;
}

export function onboardingStepLabel(step: OnboardingStepId): string {
  switch (step) {
    case "welcome":
      return "Welcome";
    case "detect-site":
      return "Your site";
    case "confirm-content":
      return "Articles folder";
    case "confirm-schema":
      return "Article fields";
    case "confirm-media":
      return "Images folder";
    case "create-draft":
      return "Test draft";
    case "open-editor":
      return "Start writing";
    default:
      return step;
  }
}

export function summarizePostsForDashboard(
  posts: PostSummary[],
): DashboardPostStats {
  const published = posts.filter((post) => !post.draft).length;
  const drafts = posts.filter((post) => post.draft).length;
  const recent = [...posts]
    .sort((left, right) => right.pubDate.localeCompare(left.pubDate))
    .slice(0, 5);

  return {
    total: posts.length,
    published,
    drafts,
    recent,
  };
}

export function pickDetectionSuggestion(
  report: SetupDetectionReport | null,
  selectedAdapter: string | null,
): SetupDetectionSuggestion | null {
  if (!report?.primary) {
    return null;
  }

  if (!selectedAdapter) {
    return report.primary;
  }

  if (report.primary.adapter === selectedAdapter) {
    return report.primary;
  }

  const alternative = report.alternatives.find(
    (candidate) => candidate.adapter === selectedAdapter,
  );
  return alternative ?? report.primary;
}

export function detectionChoices(
  report: SetupDetectionReport | null,
): SetupDetectionSuggestion[] {
  if (!report?.primary) {
    return [];
  }

  const choices = [report.primary, ...report.alternatives];
  const seen = new Set<string>();
  return choices.filter((choice) => {
    if (seen.has(choice.adapter)) {
      return false;
    }

    seen.add(choice.adapter);
    return true;
  });
}

export function createTestDraftDefaults(category: string | undefined): {
  title: string;
  description: string;
  body: string;
  draft: boolean;
  category: string;
} {
  return {
    title: "My first SourceDraft article",
    description: "A short test draft created during setup.",
    body: "## Hello from SourceDraft\n\nThis is a test draft. Edit or delete it anytime.",
    draft: true,
    category: category ?? "AI-Assisted Publishing",
  };
}

export type DashboardActionTarget =
  | "setup-wizard"
  | "posts"
  | "settings"
  | "settings-readiness"
  | "new-article";

export type DashboardNextAction = {
  id: string;
  title: string;
  detail: string;
  priority: number;
  target: DashboardActionTarget;
};

export function dashboardNextActions(options: {
  demoMode: boolean;
  githubReady: boolean;
  setupReady: boolean;
  setupNextAction: string | null;
  postStats: DashboardPostStats;
  detectionComplete: boolean;
}): DashboardNextAction[] {
  const actions: DashboardNextAction[] = [];

  if (options.demoMode) {
    actions.push({
      id: "demo-write",
      title: "Write a sample article",
      detail: "Go to Posts and click New article to try the editor.",
      priority: 1,
      target: "posts",
    });
    actions.push({
      id: "demo-connect",
      title: "Connect your real blog later",
      detail: "Exit demo mode and run setup when you are ready to publish.",
      priority: 4,
      target: "settings",
    });
    return actions.sort((left, right) => left.priority - right.priority);
  }

  if (!options.detectionComplete) {
    actions.push({
      id: "finish-setup",
      title: "Finish guided setup",
      detail: "Run the setup wizard to detect your site and confirm folders.",
      priority: 1,
      target: "setup-wizard",
    });
  }

  if (!options.githubReady) {
    actions.push({
      id: "connect-blog",
      title: "Connect your blog",
      detail: "Add your publishing details in Settings under Publishing readiness.",
      priority: 2,
      target: "settings-readiness",
    });
  }

  if (!options.setupReady && options.setupNextAction) {
    actions.push({
      id: "fix-readiness",
      title: "Fix publishing readiness",
      detail: options.setupNextAction,
      priority: 3,
      target: "settings-readiness",
    });
  }

  if (options.postStats.total === 0) {
    actions.push({
      id: "first-article",
      title: "Create your first article",
      detail: "Start with a draft — you can preview before sending.",
      priority: 4,
      target: "new-article",
    });
  } else {
    actions.push({
      id: "edit-recent",
      title: "Continue writing",
      detail: "Open a recent article from the dashboard or Posts list.",
      priority: 5,
      target: "posts",
    });
  }

  return actions.sort((left, right) => left.priority - right.priority);
}
