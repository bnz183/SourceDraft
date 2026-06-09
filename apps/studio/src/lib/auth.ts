export type AuthStatus = {
  configured: boolean;
  authenticated: boolean;
  mode: string;
};

const AUTH_FETCH_OPTIONS: RequestInit = {
  credentials: "include",
};

export async function fetchAuthStatus(): Promise<AuthStatus> {
  try {
    const response = await fetch("/api/auth/status", AUTH_FETCH_OPTIONS);
    if (!response.ok) {
      return { configured: false, authenticated: false, mode: "mvp-local-password" };
    }

    return (await response.json()) as AuthStatus;
  } catch {
    return { configured: false, authenticated: false, mode: "mvp-local-password" };
  }
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
