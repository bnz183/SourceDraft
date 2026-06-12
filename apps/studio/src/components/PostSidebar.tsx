import { useMemo, useState } from "react";
import type { PostSummary } from "../lib/posts";
import {
  createDefaultPostListFilters,
  extractCategoriesFromPosts,
  filterAndSortPosts,
  isPostListFiltered,
  type DraftFilter,
  type PostListFilters,
  type PostSort,
} from "../lib/postListFilters.js";

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

const SORT_OPTIONS: { value: PostSort; label: string }[] = [
  { value: "pubDate-desc", label: "Publish date (newest)" },
  { value: "pubDate-asc", label: "Publish date (oldest)" },
  { value: "title-asc", label: "Title (A–Z)" },
  { value: "title-desc", label: "Title (Z–A)" },
  { value: "path-asc", label: "Path (A–Z)" },
  { value: "path-desc", label: "Path (Z–A)" },
];

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
  const [filters, setFilters] = useState<PostListFilters>(
    createDefaultPostListFilters,
  );

  const categories = useMemo(
    () => extractCategoriesFromPosts(posts),
    [posts],
  );

  const visiblePosts = useMemo(
    () => filterAndSortPosts(posts, filters),
    [posts, filters],
  );

  const filtered = isPostListFiltered(filters, posts.length, visiblePosts.length);

  function updateFilters(patch: Partial<PostListFilters>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  return (
    <aside className="post-sidebar" aria-label="Articles">
      <div className="post-sidebar__header">
        <h2 className="post-sidebar__title">Articles</h2>
        <button
          type="button"
          className="button button--compact"
          disabled={loading}
          onClick={onRefresh}
          aria-label="Refresh article list"
        >
          Refresh
        </button>
      </div>

      <button
        type="button"
        className="button button--primary post-sidebar__new"
        onClick={onNewPost}
      >
        New article
      </button>

      {posts.length > 0 && (
        <div className="post-sidebar__controls" role="search">
          <label className="post-sidebar__control">
            <span className="post-sidebar__control-label">Search</span>
            <input
              className="post-sidebar__control-input"
              type="search"
              value={filters.search}
              placeholder="Title, slug, or path"
              aria-label="Search articles by title, slug, or path"
              onChange={(event) => updateFilters({ search: event.target.value })}
            />
          </label>

          <label className="post-sidebar__control">
            <span className="post-sidebar__control-label">Status</span>
            <select
              className="post-sidebar__control-input"
              value={filters.draft}
              aria-label="Filter by draft status"
              onChange={(event) =>
                updateFilters({ draft: event.target.value as DraftFilter })
              }
            >
              <option value="all">All articles</option>
              <option value="published">Published only</option>
              <option value="draft">Drafts only</option>
            </select>
          </label>

          {categories.length > 0 && (
            <label className="post-sidebar__control">
              <span className="post-sidebar__control-label">Category</span>
              <select
                className="post-sidebar__control-input"
                value={filters.category}
                aria-label="Filter by category"
                onChange={(event) =>
                  updateFilters({ category: event.target.value })
                }
              >
                <option value="">All categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="post-sidebar__control">
            <span className="post-sidebar__control-label">Sort</span>
            <select
              className="post-sidebar__control-input"
              value={filters.sort}
              aria-label="Sort articles"
              onChange={(event) =>
                updateFilters({ sort: event.target.value as PostSort })
              }
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {filtered && (
            <p className="post-sidebar__filter-summary" role="status">
              Showing {visiblePosts.length} of {posts.length}
            </p>
          )}
        </div>
      )}

      {loadPostError && (
        <div className="post-sidebar__notice notice notice--error" role="alert">
          <p className="notice__title">Could not open post</p>
          <p className="notice__body">{loadPostError}</p>
        </div>
      )}

      {!githubReady && !loading && (
        <p className="post-sidebar__hint" role="status">
          Your blog is not connected yet. Open Settings to check publishing
          readiness, or keep writing drafts locally.
        </p>
      )}

      {loading && (
        <p className="post-sidebar__status" role="status">
          Loading articles…
        </p>
      )}

      {error && (
        <div className="post-sidebar__notice notice notice--error" role="alert">
          <p className="notice__title">Could not load articles</p>
          <p className="notice__body">{error}</p>
          <p className="notice__hint">
            Open Settings and review publishing readiness, then refresh.
          </p>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <p className="post-sidebar__empty">
          No articles yet. Create one with New article, then send it to your blog.
        </p>
      )}

      {!loading && !error && posts.length > 0 && visiblePosts.length === 0 && (
        <p className="post-sidebar__empty" role="status">
          No articles match the current filters.
        </p>
      )}

      {!loading && visiblePosts.length > 0 && (
        <ul className="post-sidebar__list" role="list">
          {visiblePosts.map((post) => {
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
                    {post.pubDate.length > 0 && <span>{post.pubDate}</span>}
                    {post.category.length > 0 && (
                      <span className="post-sidebar__category">{post.category}</span>
                    )}
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
                  <code className="post-sidebar__item-path">{post.path}</code>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
