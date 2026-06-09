import type { AdapterId } from "@sourcedraft/adapters";
import {
  buildContentAuditReport,
  type ContentAuditReport,
} from "@sourcedraft/setup";
import type { PublishEnvConfig } from "./config.js";
import { getDemoPost, listDemoPosts } from "./demoStore.js";
import { createPublisherFromEnv } from "./publisherRuntime.js";
import { normalizeContentDir, safePostPath } from "./postPaths.js";
import { slugFromPath } from "./posts.js";

export type ContentAuditResponse =
  | { ok: true; report: ContentAuditReport }
  | { ok: false; error: string };

function readDemoAuditFiles(): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = [];

  for (const summary of listDemoPosts()) {
    const stored = getDemoPost(summary.path);
    if (stored !== null) {
      files.push({ path: summary.path, content: stored.content });
    }
  }

  return files;
}

export function runDemoContentAudit(
  adapter: AdapterId,
  contentDir: string,
): { status: number; body: ContentAuditResponse } {
  const files = readDemoAuditFiles();
  const report = buildContentAuditReport(
    files,
    adapter,
    normalizeContentDir(contentDir),
    slugFromPath,
  );

  return {
    status: 200,
    body: { ok: true, report },
  };
}

export async function runContentAudit(
  env: PublishEnvConfig,
): Promise<{ status: number; body: ContentAuditResponse }> {
  const contentDir = normalizeContentDir(env.contentDir);
  const adapter = env.adapter as AdapterId;

  const publisher = createPublisherFromEnv(env);
  const listed = await publisher.listPosts({ contentDir });

  if (!listed.ok) {
    return {
      status: listed.status === 404 ? 404 : 502,
      body: { ok: false, error: listed.error },
    };
  }

  const files: { path: string; content: string }[] = [];

  for (const file of listed.files) {
    const safe = safePostPath(file.path, contentDir);
    if (!safe.ok) {
      continue;
    }

    const loaded = await publisher.readPost({ path: safe.path });
    if (!loaded.ok) {
      continue;
    }

    files.push({ path: safe.path, content: loaded.content });
  }

  const report = buildContentAuditReport(files, adapter, contentDir, slugFromPath);

  return {
    status: 200,
    body: { ok: true, report },
  };
}
