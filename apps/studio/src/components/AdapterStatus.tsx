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
    { label: "Adapter", value: adapter, state: "ok" },
    { label: "Output path", value: contentDir, state: "ok" },
    {
      label: "GitHub target",
      value: githubReady ? `${githubOwner}/${githubRepo}` : "Not configured",
      state: githubReady ? "idle" : "off",
    },
    {
      label: "GitHub token",
      value: "Checked server-side on publish",
      state: "idle",
    },
    { label: "Auth", value: "Local password session", state: "ok" },
  ];

  return (
    <section className="panel adapter-status">
      <div className="panel__header">
        <h2 className="panel__title">Publishing setup</h2>
        <p className="panel__meta">
          {githubReady
            ? "GitHub repo configured in .env"
            : "Set GITHUB_OWNER and GITHUB_REPO in .env to publish"}
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
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
