import { useState, type FormEvent } from "react";

type LoginScreenProps = {
  configured: boolean;
  demoAvailable: boolean;
  demoForced: boolean;
  onLogin: (password: string) => Promise<{ ok: boolean; error?: string }>;
  onEnterDemo: () => Promise<{ ok: boolean; error?: string }>;
};

const ONBOARDING_CHOICES = [
  {
    id: "demo",
    title: "Try demo mode",
    body: "Explore SourceDraft with sample posts. Nothing is published.",
    action: "demo" as const,
  },
  {
    id: "studio",
    title: "Write in an already-configured Studio",
    body: "Use the Studio link and password from the person who set this up.",
    action: "sign-in" as const,
  },
  {
    id: "connect",
    title: "Connect an existing blog",
    body: "SourceDraft can inspect your project and suggest where articles and images should go.",
    action: "info" as const,
  },
  {
    id: "developer",
    title: "Advanced developer setup",
    body: "Use config files, adapters, publishers, and environment variables.",
    action: "info" as const,
  },
  {
    id: "agent",
    title: "Agent-ready workflow",
    body: "SourceDraft is built around structured drafts, validation, preview, and human review, so future AI agents and automation tools can fit into the publishing flow.",
    action: "info" as const,
  },
];

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
  const [activeChoice, setActiveChoice] = useState<string>(
    demoAvailable ? "demo" : "studio",
  );

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
          <p className="panel__meta">Write, preview, and publish Markdown or MDX</p>
        </div>

        {demoForced && (
          <div className="notice notice--warning login-screen__demo-notice" role="status">
            <p className="notice__title">Demo mode enabled</p>
            <p className="notice__body">
              This instance runs in demo mode. GitHub commits are disabled.
            </p>
          </div>
        )}

        <div className="login-screen__choices" aria-labelledby="login-choices-title">
          <h2 className="login-screen__choices-title" id="login-choices-title">
            How would you like to start?
          </h2>
          <ul className="login-screen__choice-list" role="list">
            {ONBOARDING_CHOICES.map((choice) => {
              const isDemoCard = choice.action === "demo";
              const demoDisabled =
                isDemoCard && (!demoAvailable || submitting || enteringDemo);

              return (
                <li key={choice.id}>
                  <article
                    className={
                      activeChoice === choice.id
                        ? "login-screen__choice-card login-screen__choice-card--active"
                        : "login-screen__choice-card"
                    }
                  >
                    <h3 className="login-screen__choice-title">{choice.title}</h3>
                    <p className="login-screen__choice-body">{choice.body}</p>
                    {isDemoCard ? (
                      <button
                        type="button"
                        className="button login-screen__choice-action"
                        disabled={demoDisabled}
                        onClick={() => {
                          setActiveChoice(choice.id);
                          void handleEnterDemo();
                        }}
                      >
                        {enteringDemo ? "Opening demo…" : "Explore demo mode"}
                      </button>
                    ) : choice.action === "sign-in" ? (
                      <button
                        type="button"
                        className="button button--compact login-screen__choice-action"
                        onClick={() => {
                          setActiveChoice(choice.id);
                          document.getElementById("login-password")?.focus();
                        }}
                      >
                        Sign in below
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="button button--compact login-screen__choice-action"
                        aria-pressed={activeChoice === choice.id}
                        onClick={() => {
                          setActiveChoice(choice.id);
                        }}
                      >
                        Learn more
                      </button>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>

          {activeChoice === "connect" && (
            <p className="login-screen__choice-detail" role="status">
              After sign-in, open <strong>Settings → Setup detection</strong> to scan
              your project folder. SourceDraft suggests where posts and images belong.
              You can still draft and preview before publishing is configured.
            </p>
          )}

          {activeChoice === "developer" && (
            <p className="login-screen__choice-detail" role="status">
              Run <code>pnpm setup</code> from the SourceDraft repository, or edit{" "}
              <code>sourcedraft.config.json</code> and <code>.env</code> manually.
              See the docs for adapters, publishers, and server-side secrets.
            </p>
          )}

          {activeChoice === "agent" && (
            <p className="login-screen__choice-detail" role="status">
              Structured article fields, validation, preview, and a publish checklist
              make SourceDraft a natural fit for AI-assisted workflows where agents
              prepare drafts and humans review before publishing. Agent API, MCP, and
              built-in AI providers are future work — not shipped today.
            </p>
          )}
        </div>

        <form className="login-screen__form" onSubmit={handleSubmit}>
          <p className="login-screen__intro">
            SourceDraft is a local writing tool, not a hosted website builder. Sign in
            with the Studio password set by whoever installed it.
          </p>

          {!configured && !demoAvailable && (
            <div className="notice notice--warning" role="status">
              <p className="notice__title">Password not configured</p>
              <p className="notice__body">
                A technical contact needs to add{" "}
                <code>SOURCEDRAFT_ADMIN_PASSWORD</code> to the server{" "}
                <code>.env</code> file and restart the API.
              </p>
            </div>
          )}

          {!configured && demoAvailable && (
            <div className="notice notice--warning" role="status">
              <p className="notice__title">Publishing not configured yet</p>
              <p className="notice__body">
                Demo mode is safe to try — nothing is published. Real publishing needs
                setup by someone technical.
              </p>
            </div>
          )}

          <label className="field field--full">
            <span className="field__label">Studio password</span>
            <input
              id="login-password"
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
      </section>
    </div>
  );
}
