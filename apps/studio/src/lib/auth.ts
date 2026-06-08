export type AuthStatus = {
  configured: boolean;
  authenticated: boolean;
  mode: string;
  demoMode?: boolean;
  demoModeForced?: boolean;
  demoModeAvailable?: boolean;
};

const AUTH_FETCH_TIMEOUT_MS = 5000;

const AUTH_FETCH_OPTIONS: RequestInit = {
  credentials: "include",
};

export async function fetchAuthStatus(): Promise<AuthStatus> {
  try {
    const response = await fetch("/api/auth/status", {
      ...AUTH_FETCH_OPTIONS,
      signal: AbortSignal.timeout(AUTH_FETCH_TIMEOUT_MS),
    });
    if (!response.ok) {
      return {
        configured: false,
        authenticated: false,
        mode: "mvp-local-password",
        demoModeAvailable: false,
      };
    }

    return (await response.json()) as AuthStatus;
  } catch {
    return {
      configured: false,
      authenticated: false,
      mode: "mvp-local-password",
      demoModeAvailable: false,
    };
  }
}

export async function enterDemo(): Promise<{ ok: boolean; error?: string }> {
  const response = await fetch("/api/auth/demo", {
    ...AUTH_FETCH_OPTIONS,
    method: "POST",
  });

  const data = (await response.json()) as { ok: boolean; error?: string };

  if (!response.ok || !data.ok) {
    return { ok: false, error: data.error ?? "Could not enter demo mode." };
  }

  return { ok: true };
}

export async function login(password: string): Promise<{ ok: boolean; error?: string }> {
  const response = await fetch("/api/auth/login", {
    ...AUTH_FETCH_OPTIONS,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password }),
  });

  const data = (await response.json()) as { ok: boolean; error?: string };

  if (!response.ok || !data.ok) {
    return { ok: false, error: data.error ?? "Login failed." };
  }

  return { ok: true };
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", {
    ...AUTH_FETCH_OPTIONS,
    method: "POST",
  });
}
