import type { PostSummary } from "../lib/posts";

type ArticlePipelineProps = {
  posts: PostSummary[];
  loading: boolean;
  error: string | null;
  githubReady: boolean;
  onRefresh: () => void;
  onEdit: (path: string) => void;
};

export function ArticlePipeline({
  posts,
  loading,
  error,
  githubReady,
  onRefresh,
  onEdit,
}: ArticlePipelineProps) {
  return (
    <section className="panel article-pipeline" aria-labelledby="posts-panel-title">
      <div className="panel__header">
        <h2 className="panel__title" id="posts-panel-title">
          Your posts
        </h2>
        <p className="panel__meta" aria-live="polite">
          {loading
            ? "Loading posts from GitHub…"
            : `${posts.length} post${posts.length === 1 ? "" : "s"} in your content folder`}
        </p>
        <button
          type="button"
          className="button button--compact article-pipeline__refresh"
          disabled={loading}
          onClick={onRefresh}
        >
          Refresh list
        </button>
      </div>

      {loading && (
        <div className="empty-state" role="status">
          <p className="empty-state__title">Loading posts…</p>
          <p className="empty-state__body">
            Fetching posts from your GitHub content folder. This may take a moment
            for larger sites.
          </p>
        </div>
      )}

      {!githubReady && !loading && (
        <div className="notice notice--warning" role="status">
          <p className="notice__title">GitHub is not configured yet</p>
          <p className="notice__body">
            Set <code>GITHUB_OWNER</code> and <code>GITHUB_REPO</code> in{" "}
            <code>.env</code>, then open <strong>Settings</strong> to confirm the
            target repository. You can still write drafts locally.
          </p>
        </div>
      )}

      {error && (
        <div className="notice notice--error" role="alert">
          <p className="notice__title">Could not load posts</p>
          <p className="notice__body">{error}</p>
          <p className="notice__hint">
            Check your GitHub token, repository settings, and{" "}
            <code>contentDir</code> in Settings. Use Refresh list after fixing
            configuration.
          </p>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="empty-state">
          <p className="empty-state__title">No posts found</p>
          <p className="empty-state__body">
            {githubReady
              ? "Nothing matched your content folder yet. Open Write to draft a post, then publish to GitHub. Published posts appear here for editing."
              : "Configure GitHub in Settings, then open Write to create your first post."}
          </p>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="article-pipeline__table-wrap">
          <table className="article-pipeline__table">
            <thead>
              <tr>
                <th scope="col">Title</th>
                <th scope="col">Date</th>
                <th scope="col">Category</th>
                <th scope="col">Status</th>
                <th scope="col" className="article-pipeline__actions">
                  <span className="visually-hidden">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.path}>
                  <td>
                    <span className="article-pipeline__title">{post.title}</span>
                    <span className="article-pipeline__path">{post.path}</span>
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
                      {post.draft ? "Draft" : "Live"}
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
