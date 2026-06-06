type PublishCheck = {
  id: string;
  label: string;
  passed: boolean;
};

type PublishGateProps = {
  checks: PublishCheck[];
  ready: boolean;
};

export function PublishGate({ checks, ready }: PublishGateProps) {
  return (
    <section className="panel publish-gate">
      <div className="panel__header">
        <h2 className="panel__title">Publish gate</h2>
        <p className="panel__meta">
          {ready ? "Ready for adapter output" : "Resolve items before publish"}
        </p>
      </div>

      <ul className="publish-gate__checks">
        {checks.map((check) => (
          <li
            key={check.id}
            className={
              check.passed
                ? "publish-gate__check publish-gate__check--passed"
                : "publish-gate__check"
            }
          >
            <span className="publish-gate__indicator" aria-hidden="true" />
            {check.label}
          </li>
        ))}
      </ul>

      <div className="publish-gate__actions">
        <button type="button" className="button button--primary" disabled={!ready}>
          Publish to GitHub
        </button>
        <button type="button" className="button" disabled>
          Preview MDX
        </button>
      </div>
    </section>
  );
}
