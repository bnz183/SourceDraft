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
      setError(result.error ?? "Sign in failed. Check your password and try again.");
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
          <p className="panel__meta">Sign in to write and publish</p>
        </div>

        <form className="login-screen__form" onSubmit={handleSubmit}>
          <p className="login-screen__intro">
            This workspace uses one shared password, checked on the server. It is
            meant for local or private use.
          </p>

          {!configured && (
            <div className="notice notice--warning" role="status">
              <p className="notice__title">Password not configured</p>
              <p className="notice__body">
                Add <code>SOURCEDRAFT_ADMIN_PASSWORD</code> to <code>.env</code>{" "}
                and restart the API server.
              </p>
            </div>
          )}

          <label className="field field--full">
            <span className="field__label">Password</span>
            <input
              className="field__input field__input--mono"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              disabled={!configured || submitting}
            />
          </label>

          {error && (
            <p className="login-screen__error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="button button--primary login-screen__submit"
            disabled={!configured || submitting || password.length === 0}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </div>
  );
}
