import type { PostSummary } from "../lib/posts";

type PostSidebarProps = {
  posts: PostSummary[];
  loading: boolean;
  error: string | null;
  githubReady: boolean;
  activePath: string | null;
  loadPostError: string | null;
  onNewPost: () => void;
  onRefresh: () => void;
  onEdit: (path: string) => void;
};

export function PostSidebar({
  posts,
  loading,
  error,
  githubReady,
  activePath,
  loadPostError,
  onNewPost,
  onRefresh,
  onEdit,
}: PostSidebarProps) {
  return (
    <aside className="post-sidebar" aria-label="Posts">
      <div className="post-sidebar__header">
        <h2 className="post-sidebar__title">Posts</h2>
        <button
          type="button"
          className="button button--compact"
          disabled={loading}
          onClick={onRefresh}
          aria-label="Refresh post list"
        >
          Refresh
        </button>
      </div>

      <button
        type="button"
        className="button button--primary post-sidebar__new"
        onClick={onNewPost}
      >
        New post
      </button>

      {loadPostError && (
        <div className="post-sidebar__notice notice notice--error" role="alert">
          <p className="notice__title">Could not open post</p>
          <p className="notice__body">{loadPostError}</p>
        </div>
      )}

      {!githubReady && !loading && (
        <p className="post-sidebar__hint" role="status">
          GitHub is not configured. Open Settings to confirm your repository, or
          write drafts locally.
        </p>
      )}

      {loading && (
        <p className="post-sidebar__status" role="status">
          Loading posts…
        </p>
      )}

      {error && (
        <div className="post-sidebar__notice notice notice--error" role="alert">
          <p className="notice__title">Could not load posts</p>
          <p className="notice__body">{error}</p>
          <p className="notice__hint">
            Check your token, repository, and content folder in Settings, then
            refresh.
          </p>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <p className="post-sidebar__empty">
          No posts yet. Create one with New post, then publish to GitHub.
        </p>
      )}

      {!loading && posts.length > 0 && (
        <ul className="post-sidebar__list" role="list">
          {posts.map((post) => {
            const isActive = activePath === post.path;
            return (
              <li key={post.path}>
                <button
                  type="button"
                  className={
                    isActive
                      ? "post-sidebar__item post-sidebar__item--active"
                      : "post-sidebar__item"
                  }
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => onEdit(post.path)}
                >
                  <span className="post-sidebar__item-title">{post.title}</span>
                  <span className="post-sidebar__item-meta">
                    <span>{post.pubDate}</span>
                    <span
                      className={
                        post.draft
                          ? "post-sidebar__status-badge"
                          : "post-sidebar__status-badge post-sidebar__status-badge--live"
                      }
                    >
                      {post.draft ? "Draft" : "Live"}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
