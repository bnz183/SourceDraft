export type HttpFetcher = typeof globalThis.fetch;

export function resolveFetcher(fetchImpl?: HttpFetcher): HttpFetcher {
  return fetchImpl ?? globalThis.fetch;
}
