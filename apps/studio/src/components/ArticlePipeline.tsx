export function ArticlePipeline() {
  return (
    <section className="panel article-pipeline">
      <div className="panel__header">
        <h2 className="panel__title">Articles</h2>
        <p className="panel__meta">Published files are not listed here yet</p>
      </div>

      <div className="empty-state">
        <p className="empty-state__title">No tracked articles</p>
        <p className="empty-state__body">
          SourceDraft does not sync your GitHub repo into this view in the
          current MVP. Use <strong>New Article</strong> to write and publish a
          post. After publishing, check the file in your repository under the
          configured content directory.
        </p>
      </div>
    </section>
  );
}
