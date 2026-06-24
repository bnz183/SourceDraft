type WriterWelcomeCardProps = {
  variant?: "login" | "settings";
};

export function WriterWelcomeCard({
  variant = "login",
}: WriterWelcomeCardProps) {
  const isLogin = variant === "login";

  if (!isLogin) {
    return (
      <section className="welcome-card" aria-labelledby="welcome-card-title">
        <div className="welcome-card__intro">
          <h2 className="welcome-card__title" id="welcome-card-title">
            Welcome to SourceDraft
          </h2>
          <p className="welcome-card__lead">
            You only need the Studio link and password. Write articles, upload
            images, preview output, and send posts to your blog without touching
            GitHub manually.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="welcome-card welcome-card--login"
      aria-labelledby="welcome-card-title"
    >
      <div className="welcome-card__intro">
        <h2 className="welcome-card__title" id="welcome-card-title">
          How do you want to start?
        </h2>
        <p className="welcome-card__lead">
          A writing dashboard for serious blogs. Try demo mode first — no
          GitHub account or API tokens required.
        </p>
      </div>

      <ol className="welcome-card__choices" role="list">
        <li className="welcome-card__choice welcome-card__choice--featured">
          <h3 className="welcome-card__choice-title">Try demo mode</h3>
          <p className="welcome-card__choice-body">
            Explore SourceDraft with sample posts. Nothing is published.
          </p>
          <p className="welcome-card__choice-hint">
            Use the <strong>Try demo mode</strong> button above.
          </p>
        </li>

        <li className="welcome-card__choice">
          <h3 className="welcome-card__choice-title">
            Write in an already-configured Studio
          </h3>
          <p className="welcome-card__choice-body">
            Use the Studio link and password from the person who set this up.
          </p>
          <p className="welcome-card__choice-hint">
            Sign in below — this is the local Studio password, not your GitHub
            login.
          </p>
        </li>

        <li className="welcome-card__choice">
          <h3 className="welcome-card__choice-title">Connect an existing blog</h3>
          <p className="welcome-card__choice-body">
            SourceDraft can inspect your project and suggest where articles and
            images should go.
          </p>
          <p className="welcome-card__choice-hint">
            After sign-in, open the <strong>Dashboard</strong> setup wizard or{" "}
            <strong>Settings</strong> → <strong>Advanced configuration</strong>.
            A technical helper can finish connecting your blog from there.
          </p>
        </li>

        <li className="welcome-card__choice welcome-card__choice--advanced">
          <h3 className="welcome-card__choice-title">Advanced developer setup</h3>
          <p className="welcome-card__choice-body">
            Use config files, adapters, publishers, and environment variables.
          </p>
          <p className="welcome-card__choice-hint">
            See the README Quickstart and <code>docs/getting-started.md</code>.
            This is not one-click setup.
          </p>
        </li>

        <li className="welcome-card__choice welcome-card__choice--workflow">
          <h3 className="welcome-card__choice-title">Agent-ready workflow</h3>
          <p className="welcome-card__choice-body">
            SourceDraft is designed around structured drafts, validation,
            preview, and human review, so future AI agents and automation tools
            can fit into the publishing flow.
          </p>
          <p className="welcome-card__choice-hint">
            Built-in AI, Agent API, and automation endpoints are not shipped
            yet. See <code>docs/roadmap.md</code> for future direction.
          </p>
        </li>
      </ol>
    </section>
  );
}
