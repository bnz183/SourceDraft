import { useState, type FormEvent } from "react";

type LoginScreenProps = {
  configured: boolean;
  demoAvailable: boolean;
  demoForced: boolean;
  onLogin: (password: string) => Promise<{ ok: boolean; error?: string }>;
  onEnterDemo: () => Promise<{ ok: boolean; error?: string }>;
};

export function LoginScreen({
  configured,
  demoAvailable,
  demoForced,
  onLogin,
  onEnterDemo,
}: LoginScreenProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [enteringDemo, setEnteringDemo] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

  async function handleEnterDemo() {
    setEnteringDemo(true);
    setError(null);

    const result = await onEnterDemo();
    if (!result.ok) {
      setError(result.error ?? "Could not enter demo mode.");
      setEnteringDemo(false);
      return;
    }

    setEnteringDemo(false);
  }

  return (
    <div className="login-screen">
      <section className="panel login-screen__panel">
        <div className="panel__header">
          <h1 className="panel__title">SourceDraft Studio</h1>
          <p className="panel__meta">Sign in to write and publish</p>
        </div>

        {demoForced && (
          <div className="notice notice--warning login-screen__demo-notice" role="status">
            <p className="notice__title">Demo mode enabled</p>
            <p className="notice__body">
              This instance runs in demo mode. GitHub commits are disabled.
            </p>
          </div>
        )}

        <form className="login-screen__form" onSubmit={handleSubmit}>
          <p className="login-screen__intro">
            This workspace uses one shared password, checked on the server. It is
            meant for local or private use.
          </p>

          {!configured && !demoAvailable && (
            <div className="notice notice--warning" role="status">
              <p className="notice__title">Password not configured</p>
              <p className="notice__body">
                Add <code>SOURCEDRAFT_ADMIN_PASSWORD</code> to <code>.env</code>{" "}
                and restart the API server.
              </p>
            </div>
          )}

          {!configured && demoAvailable && (
            <div className="notice notice--warning" role="status">
              <p className="notice__title">GitHub not configured</p>
              <p className="notice__body">
                You can explore demo mode without GitHub credentials, or configure
                a password and GitHub settings for real publishing.
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
              disabled={!configured || submitting || enteringDemo}
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
            disabled={!configured || submitting || enteringDemo || password.length === 0}
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        {demoAvailable && (
          <div className="login-screen__demo">
            <p className="login-screen__demo-copy">
              Explore Studio with sample posts. No GitHub token required.
            </p>
            <button
              type="button"
              className="button login-screen__demo-button"
              disabled={submitting || enteringDemo}
              onClick={() => {
                void handleEnterDemo();
              }}
            >
              {enteringDemo ? "Opening demo…" : "Explore demo mode"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
