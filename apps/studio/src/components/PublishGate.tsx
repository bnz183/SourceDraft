type PublishGateProps = {
  ready: boolean;
  publishing: boolean;
  publishError: string | null;
  publishSuccess: string | null;
  onPublish: () => void;
};

export function PublishGate({
  ready,
  publishing,
  publishError,
  publishSuccess,
  onPublish,
}: PublishGateProps) {
  const canPublish = ready && !publishing;

  return (
    <section className="panel publish-gate">
      <div className="panel__header">
        <h2 className="panel__title">Publish gate</h2>
        <p className="panel__meta">
          {publishing
            ? "Publishing to GitHub..."
            : ready
              ? "Passes validation"
              : "Blocked until schema is valid"}
        </p>
      </div>

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
