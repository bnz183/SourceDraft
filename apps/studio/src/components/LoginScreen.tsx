import { useState, type FormEvent } from "react";
import { WriterWelcomeCard } from "./WriterWelcomeCard.js";

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
          <p className="panel__meta">A clean writing dashboard for your blog</p>
        </div>

        <WriterWelcomeCard
          variant="login"
          demoAvailable={demoAvailable}
          enteringDemo={enteringDemo}
          onTryDemo={() => {
            void handleEnterDemo();
          }}
        />

        {demoForced && (
          <div className="notice notice--warning login-screen__demo-notice" role="status">
            <p className="notice__title">Demo mode is on</p>
            <p className="notice__body">
              This Studio runs in demo mode. Nothing is sent to a real blog.
            </p>
          </div>
        )}

        <form className="login-screen__form" onSubmit={handleSubmit}>
          <h2 className="login-screen__section-title">Sign in</h2>

          {!configured && !demoAvailable && (
            <div className="notice notice--warning" role="status">
              <p className="notice__title">Studio password not set yet</p>
              <p className="notice__body">
                Ask whoever installed SourceDraft to add a sign-in password on the
                server, or follow the developer setup steps in the README.
              </p>
            </div>
          )}

          {!configured && demoAvailable && (
            <div className="notice notice--warning" role="status">
              <p className="notice__title">Your blog is not connected yet</p>
              <p className="notice__body">
                Try demo mode to explore safely, or ask your technical helper to
                finish setup so you can publish for real.
              </p>
            </div>
          )}

          <label className="field field--full">
            <span className="field__label">Studio password</span>
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
            {submitting ? "Signing in…" : "Sign in to Studio"}
          </button>
        </form>
      </section>
    </div>
  );
}
