import { useMemo, useState, type RefObject } from "react";
import type { PostSummary } from "../lib/posts.js";
import {
  filterPostsForInternalLink,
  insertInternalLinkMarkdown,
  internalLinkHref,
  postToInternalLinkTarget,
} from "../lib/internalLinks.js";
import {
  applyResultToTextarea,
  type TextSelection,
} from "../lib/markdownEditor.js";

type InternalLinkPickerProps = {
  posts: PostSummary[];
  editingPath: string | null;
  body: string;
  selection: TextSelection;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onBodyChange: (body: string) => void;
  onClose: () => void;
};

export function InternalLinkPicker({
  posts,
  editingPath,
  body,
  selection,
  textareaRef,
  onBodyChange,
  onClose,
}: InternalLinkPickerProps) {
  const [query, setQuery] = useState("");

  const matches = useMemo(
    () => filterPostsForInternalLink(posts, query, editingPath),
    [posts, query, editingPath],
  );

  function insertTarget(post: PostSummary) {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const result = insertInternalLinkMarkdown(
      body,
      selection,
      postToInternalLinkTarget(post),
    );
    onBodyChange(result.value);
    requestAnimationFrame(() => {
      applyResultToTextarea(textarea, result);
    });
    onClose();
  }

  return (
    <div className="internal-link-picker" role="dialog" aria-label="Insert internal link">
      <div className="internal-link-picker__header">
        <p className="internal-link-picker__title">Link to existing post</p>
        <button
          type="button"
          className="button button--compact"
          aria-label="Close internal link picker"
          onClick={onClose}
        >
          Close
        </button>
      </div>

      <label className="internal-link-picker__search">
        <span className="internal-link-picker__search-label">Search posts</span>
        <input
          className="internal-link-picker__search-input"
          type="search"
          value={query}
          placeholder="Title, slug, or path"
          autoFocus
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>

      <p className="internal-link-picker__hint">
        Inserts root-relative links like{" "}
        <code>{internalLinkHref("your-slug")}</code>. Adjust paths if your site
        uses a different URL pattern.
      </p>

      {posts.length === 0 && (
        <p className="internal-link-picker__empty" role="status">
          Load posts from GitHub to link between articles.
        </p>
      )}

      {posts.length > 0 && matches.length === 0 && (
        <p className="internal-link-picker__empty" role="status">
          No posts match your search.
        </p>
      )}

      {matches.length > 0 && (
        <ul className="internal-link-picker__list" role="listbox">
          {matches.map((post) => (
            <li key={post.path}>
              <button
                type="button"
                className="internal-link-picker__item"
                role="option"
                onClick={() => {
                  insertTarget(post);
                }}
              >
                <span className="internal-link-picker__item-title">{post.title}</span>
                <span className="internal-link-picker__item-meta">
                  {post.slug} · {post.draft ? "Draft" : "Live"}
                </span>
                <code className="internal-link-picker__item-path">
                  {internalLinkHref(post.slug)}
                </code>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
