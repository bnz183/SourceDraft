export type SetupDetectionSuggestion = {
  framework: string;
  adapter: string;
  contentDir: string;
  mediaDir: string;
  publicMediaPath: string;
  defaultBranch: string;
  confidence: number;
  explanation: string;
  warnings: string[];
};

export type SetupDetectionReport = {
  scannedRoot: string;
  detected: boolean;
  primary: SetupDetectionSuggestion | null;
  alternatives: SetupDetectionSuggestion[];
  warnings: string[];
  safeToApply: boolean;
  suggestedConfigSnippet: string | null;
};

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
