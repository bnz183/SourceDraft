export type HttpFetcher = typeof globalThis.fetch;

export function resolveFetcher(fetchImpl?: HttpFetcher): HttpFetcher {
  return fetchImpl ?? globalThis.fetch;
}

export async function readResponseBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "";
  }
}

export function parseJsonBody<T>(text: string): T | null {
  if (text.trim().length === 0) {
    return null;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}
