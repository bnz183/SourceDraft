type AdapterStatusProps = {
  adapter: string;
  githubOwner: string;
  githubRepo: string;
  contentDir: string;
};

type StatusRow = {
  label: string;
  value: string;
  state: "ok" | "idle" | "off";
};

export function AdapterStatus({
  adapter,
  githubOwner,
  githubRepo,
  contentDir,
}: AdapterStatusProps) {
  const githubReady =
    githubOwner.trim().length > 0 && githubRepo.trim().length > 0;

  const rows: StatusRow[] = [
    { label: "Output format", value: adapter, state: "ok" },
    { label: "Content folder", value: contentDir, state: "ok" },
    {
      label: "GitHub repository",
      value: githubReady ? `${githubOwner}/${githubRepo}` : "Not configured",
      state: githubReady ? "idle" : "off",
    },
    {
      label: "GitHub token",
      value: "Used on the server when you publish",
      state: githubReady ? "idle" : "off",
    },
  ];

  return (
    <section className="panel adapter-status" aria-labelledby="setup-panel-title">
      <div className="panel__header">
        <h2 className="panel__title" id="setup-panel-title">
          Publishing setup
        </h2>
        <p className="panel__meta">
          {githubReady
            ? "Connected to your blog repository"
            : "Finish blog connection in Settings before sending articles"}
        </p>
      </div>

      <dl className="adapter-status__list">
        {rows.map((row) => (
          <div key={row.label} className="adapter-status__row">
            <dt>{row.label}</dt>
            <dd>
              <span
                className={`adapter-status__dot adapter-status__dot--${row.state}`}
                aria-hidden="true"
              />
              <span>{row.value}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
