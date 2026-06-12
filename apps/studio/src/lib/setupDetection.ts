export type FrontmatterFieldHint = {
  key: string;
  frequency: number;
  universalField?: string;
};

export type InferredFrontmatterSchema = {
  postsSampled: number;
  fields: FrontmatterFieldHint[];
  suggestedCategories: string[];
};

export type SetupDetectionSuggestion = {
  framework: string;
  adapter: string;
  contentDir: string;
  contentRoot: string;
  contentRootCandidates: string[];
  postFileCount: number;
  mediaDir: string;
  publicMediaPath: string;
  defaultBranch: string;
  confidence: number;
  explanation: string;
  warnings: string[];
  frontmatter: InferredFrontmatterSchema | null;
};

export type SetupDetectionReport = {
  scannedRoot: string;
  detected: boolean;
  primary: SetupDetectionSuggestion | null;
  alternatives: SetupDetectionSuggestion[];
  warnings: string[];
  onboardingMessage: string | null;
  failureMessage: string | null;
  safeToApply: boolean;
  suggestedConfigSnippet: string | null;
  configExists: boolean;
  configPreviewSummary: string | null;
};

export type GenerateConfigResult =
  | { ok: true; configPath: string; summary: string }
  | { ok: false; code: string; error: string };

export async function fetchSetupDetection(): Promise<SetupDetectionReport | null> {
  try {
    const response = await fetch("/api/setup/detect", { credentials: "include" });
    if (!response.ok) {
      return null;
    }

    return (await response.json()) as SetupDetectionReport;
  } catch {
    return null;
  }
}

export async function generateSetupConfig(): Promise<GenerateConfigResult> {
  try {
    const response = await fetch("/api/setup/generate-config", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return (await response.json()) as GenerateConfigResult;
  } catch {
    return {
      ok: false,
      code: "network",
      error: "Could not reach the setup API. Is the server running?",
    };
  }
}
