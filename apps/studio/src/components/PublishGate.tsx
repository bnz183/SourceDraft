type PublishGateProps = {
  ready: boolean;
  publishing: boolean;
  publishError: string | null;
  publishSuccess: string | null;
  githubReady: boolean;
  onPublish: () => void;
};

function disabledReason(
  ready: boolean,
  githubReady: boolean,
  publishing: boolean,
): string | null {
  if (publishing) {
    return null;
  }

  if (!githubReady) {
    return "Set GITHUB_OWNER, GITHUB_REPO, and GITHUB_TOKEN in .env, then check Settings.";
  }

  if (!ready) {
    return "Complete post details and fix validation issues first.";
  }

  return null;
}

export function PublishGate({
  ready,
  publishing,
  publishError,
  publishSuccess,
  githubReady,
  onPublish,
}: PublishGateProps) {
  const canPublish = ready && !publishing && githubReady;
  const reason = disabledReason(ready, githubReady, publishing);

  return (
    <section className="panel publish-gate" aria-labelledby="publish-panel-title">
      <div className="panel__header">
        <h2 className="panel__title" id="publish-panel-title">
          Publish
        </h2>
        <p className="panel__meta" aria-live="polite">
          {publishing
            ? "Saving to GitHub…"
            : ready
              ? "Ready to commit this post"
              : "Validate your post before publishing"}
        </p>
      </div>

      <div className="publish-gate__actions">
        <button
          type="button"
          className="button button--primary"
          disabled={!canPublish}
          aria-describedby={reason ? "publish-disabled-reason" : undefined}
          onClick={onPublish}
        >
          {publishing ? "Publishing…" : "Publish to GitHub"}
        </button>
      </div>

      {reason && (
        <p className="publish-gate__hint" id="publish-disabled-reason">
          {reason}
        </p>
      )}

      {publishError && (
        <div className="notice notice--error publish-gate__notice" role="alert">
          <p className="notice__title">Publish failed</p>
          <p className="notice__body">{publishError}</p>
          <p className="notice__hint">
            Check Settings for GitHub and path configuration, then try again.
          </p>
        </div>
      )}

      {publishSuccess && (
        <div className="notice notice--success publish-gate__notice" role="status">
          <p className="notice__title">Published</p>
          <p className="notice__body">{publishSuccess}</p>
          <p className="notice__hint">
            Your site build or CI will pick up the new file from the repository.
          </p>
        </div>
      )}
    </section>
  );
}
