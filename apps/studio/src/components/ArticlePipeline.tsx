import type { PostSummary } from "../lib/posts";

type ArticlePipelineProps = {
  posts: PostSummary[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
  onEdit: (path: string) => void;
};

export function ArticlePipeline({
  posts,
  loading,
  error,
  onRefresh,
  onEdit,
}: ArticlePipelineProps) {
  return (
    <section className="panel article-pipeline">
      <div className="panel__header">
        <h2 className="panel__title">Articles</h2>
        <p className="panel__meta">
          {loading
            ? "Loading from GitHub..."
            : `${posts.length} post${posts.length === 1 ? "" : "s"} in your content folder`}
        </p>
        <button
          type="button"
          className="button button--compact article-pipeline__refresh"
          disabled={loading}
          onClick={onRefresh}
        >
          Refresh
        </button>
      </div>

      {error && (
        <p className="article-pipeline__error">{error}</p>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="empty-state">
          <p className="empty-state__title">No posts yet</p>
          <p className="empty-state__body">
            Use <strong>New Article</strong> to write your first post. After you
            publish, it will show up here so you can edit it later.
          </p>
        </div>
      )}

      {posts.length > 0 && (
        <div className="article-pipeline__table-wrap">
          <table className="article-pipeline__table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Category</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.path}>
                  <td>
                    <span className="article-pipeline__title">{post.title}</span>
                    <code className="article-pipeline__path">{post.path}</code>
                  </td>
                  <td className="article-pipeline__mono">{post.pubDate}</td>
                  <td>{post.category}</td>
                  <td>
                    <span
                      className={
                        post.draft
                          ? "article-pipeline__badge"
                          : "article-pipeline__badge article-pipeline__badge--ready"
                      }
                    >
                      {post.draft ? "Draft" : "Published"}
                    </span>
                  </td>
                  <td className="article-pipeline__actions">
                    <button
                      type="button"
                      className="button button--compact"
                      onClick={() => onEdit(post.path)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
