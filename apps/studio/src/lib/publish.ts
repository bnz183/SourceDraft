import type { ArticleInput } from "@sourcedraft/core";
import type { PublishMode } from "@sourcedraft/publishers";

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
  publishMode?: PublishMode;
  prUrl?: string;
  prNumber?: number;
  prBranch?: string;
  baseBranch?: string;
  deployHook?: DeployHookResult;
  deployHookNote?: string;
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
  options?: {
    sourcePath?: string | null;
    publishMode?: PublishMode;
  },
): Promise<PublishApiResponse> {
  const payload: ArticleInput & { sourcePath?: string; publishMode?: PublishMode } = {
    ...article,
  };

  const sourcePath = options?.sourcePath;
  if (typeof sourcePath === "string" && sourcePath.trim().length > 0) {
    payload.sourcePath = sourcePath.trim();
  }

  if (options?.publishMode !== undefined) {
    payload.publishMode = options.publishMode;
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
