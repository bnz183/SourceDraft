import type { PostSummary } from "./posts.js";

export type DraftFilter = "all" | "draft" | "published";

export type PostSort =
  | "pubDate-desc"
  | "pubDate-asc"
  | "title-asc"
  | "title-desc"
  | "path-asc"
  | "path-desc";

export type PostListFilters = {
  search: string;
  draft: DraftFilter;
  category: string;
  sort: PostSort;
};

export function createDefaultPostListFilters(): PostListFilters {
  return {
    search: "",
    draft: "all",
    category: "",
    sort: "pubDate-desc",
  };
}

export function extractCategoriesFromPosts(posts: PostSummary[]): string[] {
  const categories = new Set<string>();

  for (const post of posts) {
    const category = post.category.trim();
    if (category.length > 0) {
      categories.add(category);
    }
  }

  return [...categories].sort((left, right) => left.localeCompare(right));
}

export function matchesPostSearch(post: PostSummary, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (normalized.length === 0) {
    return true;
  }

  const haystack = [post.title, post.slug, post.path, post.category]
    .join("\n")
    .toLowerCase();

  return haystack.includes(normalized);
}

export function matchesDraftFilter(
  post: PostSummary,
  draft: DraftFilter,
): boolean {
  if (draft === "all") {
    return true;
  }

  if (draft === "draft") {
    return post.draft;
  }

  return !post.draft;
}

export function matchesCategoryFilter(
  post: PostSummary,
  category: string,
): boolean {
  const selected = category.trim();
  if (selected.length === 0) {
    return true;
  }

  return post.category.trim() === selected;
}

function comparePosts(
  left: PostSummary,
  right: PostSummary,
  sort: PostSort,
): number {
  switch (sort) {
    case "pubDate-desc":
      return right.pubDate.localeCompare(left.pubDate) || left.title.localeCompare(right.title);
    case "pubDate-asc":
      return left.pubDate.localeCompare(right.pubDate) || left.title.localeCompare(right.title);
    case "title-asc":
      return left.title.localeCompare(right.title);
    case "title-desc":
      return right.title.localeCompare(left.title);
    case "path-asc":
      return left.path.localeCompare(right.path);
    case "path-desc":
      return right.path.localeCompare(left.path);
  }
}

export function filterAndSortPosts(
  posts: PostSummary[],
  filters: PostListFilters,
): PostSummary[] {
  const filtered = posts.filter(
    (post) =>
      matchesPostSearch(post, filters.search) &&
      matchesDraftFilter(post, filters.draft) &&
      matchesCategoryFilter(post, filters.category),
  );

  return [...filtered].sort((left, right) => comparePosts(left, right, filters.sort));
}

export function isPostListFiltered(
  filters: PostListFilters,
  totalCount: number,
  visibleCount: number,
): boolean {
  return (
    filters.search.trim().length > 0 ||
    filters.draft !== "all" ||
    filters.category.trim().length > 0 ||
    visibleCount !== totalCount
  );
}
