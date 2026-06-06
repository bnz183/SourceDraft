type PipelineItem = {
  slug: string;
  title: string;
  status: "draft" | "ready";
  updatedAt: string;
  category: string;
};

const PIPELINE: PipelineItem[] = [
  {
    slug: "draft-outline",
    title: "Draft outline",
    status: "draft",
    updatedAt: "2026-06-05",
    category: "Uncategorized",
  },
  {
    slug: "release-notes-june",
    title: "Release notes — June",
    status: "ready",
    updatedAt: "2026-06-04",
    category: "Updates",
  },
];

export function ArticlePipeline() {
  return (
    <section className="panel article-pipeline">
      <div className="panel__header">
        <h2 className="panel__title">Article pipeline</h2>
        <p className="panel__meta">2 items in workspace</p>
      </div>

      <table className="article-pipeline__table">
        <thead>
          <tr>
            <th scope="col">Title</th>
            <th scope="col">Slug</th>
            <th scope="col">Category</th>
            <th scope="col">Updated</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {PIPELINE.map((item) => (
            <tr key={item.slug}>
              <td>{item.title}</td>
              <td>
                <code>{item.slug}</code>
              </td>
              <td>{item.category}</td>
              <td>{item.updatedAt}</td>
              <td>
                <span
                  className={
                    item.status === "ready"
                      ? "article-pipeline__badge article-pipeline__badge--ready"
                      : "article-pipeline__badge"
                  }
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
