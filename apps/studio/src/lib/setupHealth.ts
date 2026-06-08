export type SetupHealthCheck = {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type SetupHealthReport = {
  ok: boolean;
  adminPasswordConfigured: boolean;
  githubOwnerConfigured: boolean;
  githubRepoConfigured: boolean;
  githubTokenConfigured: boolean;
  contentDirConfigured: boolean;
  mediaDirConfigured: boolean;
  publicMediaPathConfigured: boolean;
  adapterValid: boolean;
  demoModeForced: boolean;
  demoModeAvailable: boolean;
  githubReady: boolean;
  checks: SetupHealthCheck[];
  nextAction: string | null;
};

export async function fetchSetupHealth(): Promise<SetupHealthReport | null> {
  try {
    const response = await fetch("/api/health/setup", { credentials: "include" });
    if (!response.ok) {
      return null;
    }

    return (await response.json()) as SetupHealthReport;
  } catch {
    return null;
  }
}
