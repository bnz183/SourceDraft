export type WordPressOperation = "create" | "update" | "uploadMedia";

export type WordPressErrorContext = {
  apiUrl?: string;
  postId?: string;
};

export function formatWordPressApiError(
  status: number,
  rawMessage: string,
  operation: WordPressOperation,
  context: WordPressErrorContext = {},
): string {
  const message = rawMessage.trim();
  const endpoint = context.apiUrl ?? "WORDPRESS_API_URL";

  if (status === 401) {
    return "WordPress rejected the credentials (401). Check WORDPRESS_USERNAME and WORDPRESS_APP_PASSWORD in .env.";
  }

  if (status === 403) {
    return `WordPress denied access (403). The user needs permission to ${operation === "update" ? "edit" : "create"} posts.`;
  }

  if (status === 404) {
    if (operation === "update") {
      return `WordPress post ${context.postId ?? "unknown"} was not found. Provide a valid remoteId to update an existing post.`;
    }

    return `WordPress REST API was not found at ${endpoint}. Check WORDPRESS_API_URL (expected format: https://example.com/wp-json).`;
  }

  if (message.length > 0) {
    return `WordPress API error (${status}): ${message}`;
  }

  return `WordPress API request failed (${status}).`;
}
