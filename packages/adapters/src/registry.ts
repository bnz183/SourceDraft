import { slugFromFilename } from "@sourcedraft/adapter-eleventy-jekyll-markdown";
import type { ArticleInput } from "@sourcedraft/core";
import {
  frontmatterToArticleInputWithSlug,
} from "./adapterRegistry.js";
import type { AdapterId } from "./types.js";

import "./registerBuiltInAdapters.js";

export {
  adapterRegistry,
  frontmatterToArticleInputWithSlug,
  getAdapter,
  getAdapterDefinition,
  getAdapterPostPath,
  getAdapterPreviewMeta,
  getAdapterPreviewNavHint,
  isAdapterId,
  listAdapterIds,
  registerAdapter,
  renderAdapterOutput,
  supportedAdapterSummary,
} from "./adapterRegistry.js";

function defaultSlugFromPath(path: string): string {
  const filename = path.split("/").pop() ?? "";
  return slugFromFilename(filename);
}

export function frontmatterToArticleInput(
  adapterId: AdapterId,
  path: string,
  frontmatter: Record<string, unknown>,
  body: string,
): ArticleInput {
  return frontmatterToArticleInputWithSlug(
    adapterId,
    path,
    frontmatter,
    body,
    defaultSlugFromPath,
  );
}
