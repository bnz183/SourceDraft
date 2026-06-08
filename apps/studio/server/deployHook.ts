import { resolveFetcher } from "./http.js";

export type DeployHookProvider = "generic" | "vercel" | "netlify" | "cloudflare-pages";

export type DeployHookResult = {
  triggered: boolean;
  ok: boolean;
  status?: number;
  message: string;
};

export type DeployHookConfig = {
  url?: string;
  method?: string;
  provider?: DeployHookProvider;
  strict?: boolean;
  fetch?: typeof globalThis.fetch;
};

function resolveProvider(raw: string | undefined): DeployHookProvider {
  if (
    raw === "vercel" ||
    raw === "netlify" ||
    raw === "cloudflare-pages" ||
    raw === "generic"
  ) {
    return raw;
  }

  return "generic";
}

function buildDeployHookRequest(
  provider: DeployHookProvider,
  publishPath: string,
): { headers: Record<string, string>; body?: string } {
  const payload = JSON.stringify({
    source: "sourcedraft",
    path: publishPath,
  });

  if (provider === "vercel") {
    return {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "SourceDraft/1.0",
      },
      body: payload,
    };
  }

  if (provider === "netlify") {
    return {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "SourceDraft/1.0",
      },
      body: payload,
    };
  }

  if (provider === "cloudflare-pages") {
    return {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "SourceDraft/1.0",
      },
      body: payload,
    };
  }

  return {
    headers: {
      "Content-Type": "application/json",
      "User-Agent": "SourceDraft/1.0",
    },
    body: payload,
  };
}

export function loadDeployHookConfigFromEnv(): DeployHookConfig {
  const url = process.env.DEPLOY_HOOK_URL?.trim();
  const method = process.env.DEPLOY_HOOK_METHOD?.trim().toUpperCase() || "POST";
  const provider = resolveProvider(process.env.DEPLOY_HOOK_PROVIDER?.trim());
  const strict = process.env.DEPLOY_HOOK_STRICT?.trim().toLowerCase() === "true";

  return {
    ...(url ? { url } : {}),
    method,
    provider,
    strict,
  };
}

export async function triggerDeployHook(
  publishPath: string,
  config: DeployHookConfig = loadDeployHookConfigFromEnv(),
): Promise<DeployHookResult> {
  if (!config.url) {
    return {
      triggered: false,
      ok: true,
      message: "Deploy hook not configured.",
    };
  }

  const fetchImpl = resolveFetcher(config.fetch);
  const method = config.method ?? "POST";
  const provider = config.provider ?? "generic";
  const request = buildDeployHookRequest(provider, publishPath);

  try {
    const response = await fetchImpl(config.url, {
      method,
      headers: request.headers,
      ...(request.body !== undefined ? { body: request.body } : {}),
    });

    if (!response.ok) {
      const message = `Deploy hook failed (${response.status}).`;
      return {
        triggered: true,
        ok: false,
        status: response.status,
        message,
      };
    }

    return {
      triggered: true,
      ok: true,
      status: response.status,
      message: `Deploy hook succeeded (${response.status}).`,
    };
  } catch (error) {
    const message =
      error instanceof Error
        ? `Deploy hook request failed: ${error.message}`
        : "Deploy hook request failed.";

    return {
      triggered: true,
      ok: false,
      message,
    };
  }
}

export function applyDeployHookStrictMode(
  publishOk: boolean,
  deployHook: DeployHookResult,
  strict: boolean,
): { ok: boolean; error?: string } {
  if (!publishOk) {
    return { ok: false };
  }

  if (!deployHook.triggered || deployHook.ok || !strict) {
    return { ok: true };
  }

  return {
    ok: false,
    error: `${deployHook.message} Publish was rolled back because DEPLOY_HOOK_STRICT=true.`,
  };
}
