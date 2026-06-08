import type { ArticleInput } from "@sourcedraft/core";

export type DeployHookResult = {
  triggered: boolean;
  ok: boolean;
  status?: number;
  message: string;
};

export type PublishApiSuccess = {
  ok: true;
  path: string;
  created: boolean;
  sha: string;
  commitSha: string;
  remoteId?: string;
  deployHook?: DeployHookResult;
};

export type PublishApiError = {
  ok: false;
  error: string;
  issues?: { field: string; message: string }[];
  status?: number;
};

export type PublishApiResponse = PublishApiSuccess | PublishApiError;

export async function publishArticle(
  article: ArticleInput,
  sourcePath?: string | null,
): Promise<PublishApiResponse> {
  const payload: ArticleInput & { sourcePath?: string } = { ...article };

  if (typeof sourcePath === "string" && sourcePath.trim().length > 0) {
    payload.sourcePath = sourcePath.trim();
  }

  const response = await fetch("/api/publish", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as PublishApiResponse;

  if (!response.ok || !data.ok) {
    return data.ok
      ? {
          ok: false,
          error:
            "Publish to GitHub failed. Check token, owner/repo, and contentDir.",
        }
      : data;
  }

  return data;
}
