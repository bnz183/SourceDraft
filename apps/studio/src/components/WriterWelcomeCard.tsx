type WriterWelcomeCardProps = {
  variant?: "login" | "settings";
  demoAvailable?: boolean;
  onTryDemo?: () => void;
  enteringDemo?: boolean;
};

export function WriterWelcomeCard({
  variant = "login",
  demoAvailable = false,
  onTryDemo,
  enteringDemo = false,
}: WriterWelcomeCardProps) {
  const isLogin = variant === "login";

  return (
    <section
      className={isLogin ? "welcome-card welcome-card--login" : "welcome-card"}
      aria-labelledby="welcome-card-title"
    >
      <div className="welcome-card__intro">
        <h2 className="welcome-card__title" id="welcome-card-title">
          {isLogin ? "Your writing dashboard" : "Welcome to SourceDraft"}
        </h2>
        <p className="welcome-card__lead">
          Write, preview, and publish serious blog posts while you keep ownership
          of your content.
        </p>
      </div>

      <ul className="welcome-card__choices" role="list">
        {demoAvailable && (
          <li className="welcome-card__choice">
            <h3 className="welcome-card__choice-title">Try demo mode</h3>
            <p className="welcome-card__choice-body">
              Explore SourceDraft without connecting a real blog. No real posts
              are published, sample content resets when the server restarts, and
              it is safe to click around.
            </p>
            {isLogin && onTryDemo && (
              <button
                type="button"
                className="button welcome-card__choice-action"
                disabled={enteringDemo}
                onClick={onTryDemo}
              >
                {enteringDemo ? "Opening demo…" : "Try demo mode"}
              </button>
            )}
          </li>
        )}

        <li className="welcome-card__choice">
          <h3 className="welcome-card__choice-title">
            {isLogin ? "Write in a configured Studio" : "Already set up for you"}
          </h3>
          <p className="welcome-card__choice-body">
            {isLogin
              ? "If someone installed SourceDraft for your publication, sign in with the Studio password they gave you."
              : "You only need the Studio link and password. Write articles, upload images, preview output, and send posts to your blog without touching GitHub manually."}
          </p>
        </li>

        <li className="welcome-card__choice">
          <h3 className="welcome-card__choice-title">Connect an existing blog</h3>
          <p className="welcome-card__choice-body">
            Setting up SourceDraft for Astro, Hugo, WordPress, Ghost, or another
            site? Run the guided setup once, or ask a technical helper to point
            SourceDraft at your blog repository or CMS.
          </p>
        </li>

        <li className="welcome-card__choice">
          <h3 className="welcome-card__choice-title">Advanced developer setup</h3>
          <p className="welcome-card__choice-body">
            Clone the repository, edit <code>sourcedraft.config.json</code> and{" "}
            <code>.env</code>, and choose adapters and publishers. See the README
            Quickstart and <code>docs/getting-started.md</code>.
          </p>
        </li>
      </ul>
    </section>
  );
}
