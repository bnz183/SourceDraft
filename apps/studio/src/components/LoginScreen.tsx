import { useState } from "react";

type LoginScreenProps = {
  configured: boolean;
  onLogin: (password: string) => Promise<{ ok: boolean; error?: string }>;
};

export function LoginScreen({ configured, onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await onLogin(password);
    if (!result.ok) {
      setError(result.error ?? "Login failed.");
      setSubmitting(false);
      return;
    }

    setPassword("");
    setSubmitting(false);
  }

  return (
    <div className="login-screen">
      <section className="panel login-screen__panel">
        <div className="panel__header">
          <h1 className="panel__title">SourceDraft Studio</h1>
          <p className="panel__meta">Sign in to your local writing workspace</p>
        </div>

        <form className="login-screen__form" onSubmit={handleSubmit}>
          <p className="login-screen__intro">
            Studio is protected by a server-side password. This MVP setup uses
            one shared admin password, not user accounts.
          </p>

          {!configured && (
            <p className="login-screen__notice">
              Add <code>SOURCEDRAFT_ADMIN_PASSWORD</code> to <code>.env</code>{" "}
              and restart the API server.
            </p>
          )}

          <label className="field field--full">
            <span className="field__label">Admin password</span>
            <input
              className="field__input field__input--mono"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              disabled={!configured || submitting}
            />
          </label>

          {error && <p className="login-screen__error">{error}</p>}

          <button
            type="submit"
            className="button button--primary login-screen__submit"
            disabled={!configured || submitting || password.length === 0}
          >
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </div>
  );
}
