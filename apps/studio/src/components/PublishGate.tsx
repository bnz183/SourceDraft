type PublishGateProps = {
  ready: boolean;
  publishing: boolean;
  publishError: string | null;
  publishSuccess: string | null;
  githubReady: boolean;
  onPublish: () => void;
};

export function PublishGate({
  ready,
  publishing,
  publishError,
  publishSuccess,
  githubReady,
  onPublish,
}: PublishGateProps) {
  const canPublish = ready && !publishing && githubReady;

  return (
    <section className="panel publish-gate">
      <div className="panel__header">
        <h2 className="panel__title">Publish</h2>
        <p className="panel__meta">
          {publishing
            ? "Committing MDX to GitHub..."
            : ready
              ? "Article is valid"
              : "Complete required fields first"}
        </p>
      </div>

      {!githubReady && (
        <p className="publish-gate__hint">
          Publishing needs <code>GITHUB_TOKEN</code>, <code>GITHUB_OWNER</code>,
          and <code>GITHUB_REPO</code> in <code>.env</code>. The token stays on
          the server and is never sent to the browser.
        </p>
      )}

      <div className="publish-gate__actions">
        <button
          type="button"
          className="button button--primary"
          disabled={!canPublish}
          onClick={onPublish}
        >
          {publishing ? "Publishing..." : "Publish to GitHub"}
        </button>
      </div>

      {publishError && (
        <p className="publish-gate__message publish-gate__message--error">
          {publishError}
        </p>
      )}

      {publishSuccess && (
        <p className="publish-gate__message publish-gate__message--success">
          {publishSuccess}
        </p>
      )}
    </section>
  );
}
