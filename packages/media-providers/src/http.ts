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
