type PublishGateProps = {
  ready: boolean;
};

export function PublishGate({ ready }: PublishGateProps) {
  return (
    <section className="panel publish-gate">
      <div className="panel__header">
        <h2 className="panel__title">Publish gate</h2>
        <p className="panel__meta">
          {ready ? "Passes validation" : "Blocked until schema is valid"}
        </p>
      </div>

      <div className="publish-gate__actions">
        <button type="button" className="button button--primary" disabled={!ready}>
          Publish to GitHub
        </button>
        <button type="button" className="button" disabled={!ready}>
          Export normalized article
        </button>
      </div>
    </section>
  );
}
