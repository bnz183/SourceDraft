import type { PostSummary } from "./posts.js";
import type { ApplyResult, TextSelection } from "./markdownEditor.js";

export type InternalLinkTarget = {
  title: string;
  slug: string;
};

export function internalLinkHref(slug: string): string {
  const cleaned = slug.trim().replace(/^\/+/u, "").replace(/\/+$/u, "");
  if (cleaned.length === 0) {
    return "/";
  }

  return `/${cleaned}`;
}

export function buildInternalLinkMarkdown(
  target: InternalLinkTarget,
  linkText?: string,
): string {
  const text =
    linkText?.trim() ||
    target.title.trim() ||
    target.slug.trim() ||
    "Post link";
  return `[${text}](${internalLinkHref(target.slug)})`;
}

export function insertInternalLinkMarkdown(
  body: string,
  selection: TextSelection,
  target: InternalLinkTarget,
): ApplyResult {
  const selected = body.slice(selection.start, selection.end);
  const markdown = buildInternalLinkMarkdown(
    target,
    selected.length > 0 ? selected : undefined,
  );
  const value =
    body.slice(0, selection.start) + markdown + body.slice(selection.end);
  const selectionStart = selection.start;
  const selectionEnd = selectionStart + markdown.length;

  return { value, selectionStart, selectionEnd };
}

export function filterPostsForInternalLink(
  posts: PostSummary[],
  query: string,
  excludePath?: string | null,
): PostSummary[] {
  const normalized = query.trim().toLowerCase();

  return posts
    .filter((post) => (excludePath ? post.path !== excludePath : true))
    .filter((post) => {
      if (normalized.length === 0) {
        return true;
      }

      const haystack = [post.title, post.slug, post.path].join("\n").toLowerCase();
      return haystack.includes(normalized);
    })
    .slice(0, 25);
}

export function postToInternalLinkTarget(post: PostSummary): InternalLinkTarget {
  return {
    title: post.title,
    slug: post.slug,
  };
}
