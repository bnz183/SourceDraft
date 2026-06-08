import type { Article, ArticleInput } from "@sourcedraft/core";
import type {
  Adapter,
  AdapterId,
  AdapterPathConfig,
  AdapterPreviewMeta,
} from "./types.js";

const adapters = new Map<AdapterId, Adapter>();

export function registerAdapter(adapter: Adapter): void {
  adapters.set(adapter.id, adapter);
}

export function listAdapterIds(): AdapterId[] {
  return [...adapters.keys()];
}

export function isAdapterId(value: string): value is AdapterId {
  return adapters.has(value as AdapterId);
}

export function getAdapter(adapterId: AdapterId): Adapter {
  const adapter = adapters.get(adapterId);
  if (adapter === undefined) {
    throw new Error(`Adapter "${adapterId}" is not registered.`);
  }

  return adapter;
}

export function getAdapterPreviewMeta(adapterId: AdapterId): AdapterPreviewMeta {
  return getAdapter(adapterId).previewMeta;
}

export function getAdapterPreviewNavHint(
  adapterId: AdapterId,
  article: Article,
  path: string,
  adapterOptions?: Record<string, unknown>,
): string | undefined {
  const adapter = getAdapter(adapterId);
  return adapter.previewNavHint?.(article, path, adapterOptions);
}

export function renderAdapterOutput(
  adapterId: AdapterId,
  article: Article,
  adapterOptions?: Record<string, unknown>,
): string {
  return getAdapter(adapterId).render(article, adapterOptions);
}

export function getAdapterPostPath(
  adapterId: AdapterId,
  article: Article,
  config: AdapterPathConfig,
): string {
  return getAdapter(adapterId).getPath(article, config);
}

export function frontmatterToArticleInputWithSlug(
  adapterId: AdapterId,
  path: string,
  frontmatter: Record<string, unknown>,
  body: string,
  slugFromPath: (path: string) => string,
): ArticleInput {
  return getAdapter(adapterId).fromFrontmatter(
    path,
    frontmatter,
    body,
    slugFromPath,
  );
}

export function supportedAdapterSummary(): string {
  return listAdapterIds().join(", ");
}

/** @deprecated Use `getAdapter` */
export function getAdapterDefinition(adapterId: AdapterId): Adapter {
  return getAdapter(adapterId);
}

export const adapterRegistry = {
  register: registerAdapter,
  listIds: listAdapterIds,
  isKnown: isAdapterId,
  get: getAdapter,
  previewMeta: getAdapterPreviewMeta,
  previewNavHint: getAdapterPreviewNavHint,
  render: renderAdapterOutput,
  getPath: getAdapterPostPath,
  fromFrontmatterWithSlug: frontmatterToArticleInputWithSlug,
  supportedSummary: supportedAdapterSummary,
};
