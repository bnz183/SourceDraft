import { useState, type FormEvent } from "react";
import { DEMO_DEFAULT_PASSWORD } from "../lib/demoDefaults";

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
  const [useDemoMode, setUseDemoMode] = useState(demoForced);
  const showDemoToggle = demoAvailable || demoForced;
  const demoUiActive = demoForced || (demoAvailable && useDemoMode);

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

        {showDemoToggle && (
          <label className="field field--checkbox login-screen__demo-toggle">
            <input
              type="checkbox"
              checked={useDemoMode}
              disabled={demoForced || submitting || enteringDemo}
              onChange={(event) => {
                setUseDemoMode(event.target.checked);
                setError(null);
              }}
            />
            <span>Demo mode</span>
          </label>
        )}

        {demoUiActive && (
          <div className="notice notice--warning login-screen__demo-notice" role="status">
            <p className="notice__title">
              {demoForced ? "Demo mode enabled on this server" : "Exploring in demo mode"}
            </p>
            <p className="notice__body">
              {demoForced
                ? "GitHub and remote publisher commits are disabled."
                : "Sample posts only — publish and uploads are simulated."}{" "}
              Default demo password is <code>{DEMO_DEFAULT_PASSWORD}</code>. Change{" "}
              <code>SOURCEDRAFT_ADMIN_PASSWORD</code> in <code>.env</code> before shared or
              production use.
            </p>
          </div>
        )}

        {demoUiActive ? (
          <div className="login-screen__demo">
            <p className="login-screen__demo-copy">
              Continue without a configured publisher, or sign in with the demo password below.
            </p>
            <button
              type="button"
              className="button button--primary login-screen__demo-button"
              disabled={submitting || enteringDemo}
              onClick={() => {
                void handleEnterDemo();
              }}
            >
              {enteringDemo ? "Opening demo…" : "Continue in demo"}
            </button>

            {configured && (
              <form className="login-screen__form login-screen__form--inline" onSubmit={handleSubmit}>
                <p className="login-screen__intro">
                  Or sign in with password <code>{DEMO_DEFAULT_PASSWORD}</code> (from your{" "}
                  <code>.env</code>).
                </p>
                <label className="field field--full">
                  <span className="field__label">Password</span>
                  <input
                    className="field__input field__input--mono"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    placeholder={DEMO_DEFAULT_PASSWORD}
                    disabled={submitting || enteringDemo}
                  />
                </label>
                {error && (
                  <p className="login-screen__error" role="alert">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  className="button login-screen__submit"
                  disabled={submitting || enteringDemo || password.length === 0}
                >
                  {submitting ? "Signing in…" : "Sign in"}
                </button>
              </form>
            )}
            {!configured && error && (
              <p className="login-screen__error" role="alert">
                {error}
              </p>
            )}
          </div>
        ) : (
          <form className="login-screen__form" onSubmit={handleSubmit}>
            <p className="login-screen__intro">
              This workspace uses one shared password, checked on the server. It is meant for
              local or private use.
            </p>

            {!configured && !demoAvailable && (
              <div className="notice notice--warning" role="status">
                <p className="notice__title">Password not configured</p>
                <p className="notice__body">
                  Add <code>SOURCEDRAFT_ADMIN_PASSWORD</code> to <code>.env</code> and restart the
                  API server.
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
        )}
      </section>
    </div>
  );
}
