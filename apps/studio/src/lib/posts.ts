import type { ArticleInput } from "@sourcedraft/core";

export type PostSummary = {
  path: string;
  title: string;
  slug: string;
  pubDate: string;
  category: string;
  draft: boolean;
};

export type FetchPostsSuccess = {
  ok: true;
  posts: PostSummary[];
};

export type FetchPostsError = {
  ok: false;
  error: string;
};

export type FetchPostsResponse = FetchPostsSuccess | FetchPostsError;

export type LoadedPost = ArticleInput & {
  sourcePath?: string;
};

export type FetchPostSuccess = {
  ok: true;
  path: string;
  article: LoadedPost;
};

export type FetchPostError = {
  ok: false;
  error: string;
  issues?: { field: string; message: string }[];
};

export type FetchPostResponse = FetchPostSuccess | FetchPostError;

export async function fetchPosts(): Promise<FetchPostsResponse> {
  try {
    const response = await fetch("/api/posts", { credentials: "include" });
    const data = (await response.json()) as FetchPostsResponse;

    if (!response.ok || !data.ok) {
      return data.ok
        ? {
            ok: false,
            error:
              "Could not load posts. Check GitHub token, owner/repo, and contentDir.",
          }
        : data;
    }

    return data;
  } catch {
    return { ok: false, error: "Could not reach the posts API. Is the server running?" };
  }
}

export async function fetchPost(path: string): Promise<FetchPostResponse> {
  try {
    const response = await fetch(
      `/api/posts?path=${encodeURIComponent(path)}`,
      { credentials: "include" },
    );
    const data = (await response.json()) as FetchPostResponse;

    if (!response.ok || !data.ok) {
      return data.ok
        ? {
            ok: false,
            error: "Could not open this post. It may have been moved or deleted.",
          }
        : data;
    }

    return data;
  } catch {
    return { ok: false, error: "Could not reach the posts API. Is the server running?" };
  }
}
