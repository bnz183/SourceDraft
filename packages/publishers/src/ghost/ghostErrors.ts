export type GhostOperation = "create" | "update" | "uploadMedia";

export type GhostErrorContext = {
  adminUrl?: string;
  postId?: string;
};

export function formatGhostApiError(
  status: number,
  rawMessage: string,
  operation: GhostOperation,
  context: GhostErrorContext = {},
): string {
  const message = rawMessage.trim();
  const site = context.adminUrl ?? "GHOST_ADMIN_URL";

  if (status === 401 || status === 403) {
    return "Ghost rejected the Admin API credentials. Check GHOST_ADMIN_API_KEY in .env and that the integration is active.";
  }

  if (status === 404) {
    if (operation === "update") {
      return `Ghost post ${context.postId ?? "unknown"} was not found. Provide a valid remoteId to update an existing post.`;
    }

    return `Ghost Admin API was not found at ${site}. Check GHOST_ADMIN_URL (site root URL, no /ghost path).`;
  }

  if (message.length > 0) {
    return `Ghost API error (${status}): ${message}`;
  }

  return `Ghost API request failed (${status}).`;
}
