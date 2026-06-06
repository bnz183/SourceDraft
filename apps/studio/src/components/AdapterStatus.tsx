type StatusRow = {
  label: string;
  value: string;
  state: "ok" | "idle" | "off";
};

const ROWS: StatusRow[] = [
  { label: "Adapter", value: "astro-mdx", state: "ok" },
  { label: "Publisher", value: "github-publisher", state: "idle" },
  { label: "GitHub", value: "Not connected", state: "off" },
  { label: "Auth", value: "Not configured", state: "off" },
];

export function AdapterStatus() {
  return (
    <section className="panel adapter-status">
      <div className="panel__header">
        <h2 className="panel__title">Adapter status</h2>
        <p className="panel__meta">Runtime wiring pending</p>
      </div>

      <dl className="adapter-status__list">
        {ROWS.map((row) => (
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
