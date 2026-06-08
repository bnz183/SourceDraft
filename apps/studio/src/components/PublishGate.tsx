type PublishGateProps = {
  ready: boolean;
  publishing: boolean;
  publishError: string | null;
  publishSuccess: string | null;
  githubReady: boolean;
  demoMode: boolean;
  onPublish: () => void;
};

function disabledReason(
  ready: boolean,
  githubReady: boolean,
  publishing: boolean,
  demoMode: boolean,
): string | null {
  if (publishing) {
    return null;
  }

  if (!githubReady && !demoMode) {
    return "Set GITHUB_OWNER, GITHUB_REPO, and GITHUB_TOKEN in .env, then check Settings.";
  }

  if (!ready) {
    return "Fix validation issues in Post details before publishing.";
  }

  return null;
}

export function PublishGate({
  ready,
  publishing,
  publishError,
  publishSuccess,
  githubReady,
  demoMode,
  onPublish,
}: PublishGateProps) {
  const canPublish = ready && !publishing && (githubReady || demoMode);
  const reason = disabledReason(ready, githubReady, publishing, demoMode);

  return (
    <section className="publish-bar" aria-labelledby="publish-bar-title">
      <div className="publish-bar__main">
        <div className="publish-bar__copy">
          <h2 className="publish-bar__title" id="publish-bar-title">
            Publish
          </h2>
          <p className="publish-bar__meta" aria-live="polite">
            {publishing
              ? demoMode
                ? "Simulating publish…"
                : "Saving to GitHub…"
              : ready
                ? demoMode
                  ? "Demo mode will simulate a successful publish"
                  : "Your post will be committed to the repository"
                : "Complete required fields to enable publish"}
          </p>
        </div>
        <button
          type="button"
          className="button button--primary publish-bar__button"
          disabled={!canPublish}
          aria-describedby={reason ? "publish-disabled-reason" : undefined}
          onClick={onPublish}
        >
          {publishing
            ? "Publishing…"
            : demoMode
              ? "Simulate publish"
              : "Publish to GitHub"}
        </button>
      </div>

      {reason && (
        <p className="publish-bar__hint" id="publish-disabled-reason">
          {reason}
        </p>
      )}

      {publishError && (
        <div className="notice notice--error publish-bar__notice" role="alert">
          <p className="notice__title">Publish failed</p>
          <p className="notice__body">{publishError}</p>
          <p className="notice__hint">
            Check Settings for GitHub and path configuration, then try again.
          </p>
        </div>
      )}

      {publishSuccess && (
        <div className="notice notice--success publish-bar__notice" role="status">
          <p className="notice__title">
            {demoMode ? "Publish simulated" : "Published successfully"}
          </p>
          <p className="notice__body">{publishSuccess}</p>
          <p className="notice__hint">
            {demoMode
              ? "No GitHub commit was made. Configure GitHub in .env for real publishing."
              : "Your site build or CI will pick up the file from the repository."}
          </p>
        </div>
      )}
    </section>
  );
}
