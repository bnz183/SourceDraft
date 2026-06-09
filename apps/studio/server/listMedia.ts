import { joinPublicMediaPath } from "@sourcedraft/config";
import { createGitHubPublisher } from "@sourcedraft/github-publisher";
import type { PublishEnvConfig } from "./config.js";
import { filenameFromRepoPath, normalizeMediaDir, safeMediaPath } from "./mediaPaths.js";
import {
  mediaKindFromExtension,
  normalizeExtension,
} from "./mediaValidation.js";

export type MediaFileSummary = {
  repoPath: string;
  publicPath: string;
  filename: string;
  extension: string;
  kind: "image" | "pdf";
  size: number;
};

export type ListMediaSuccess = {
  ok: true;
  files: MediaFileSummary[];
};

export type ListMediaError = {
  ok: false;
  error: string;
};

export type ListMediaResponse = ListMediaSuccess | ListMediaError;

export async function listMedia(
  env: PublishEnvConfig,
): Promise<{ status: number; body: ListMediaResponse }> {
  const mediaDir = normalizeMediaDir(env.mediaDir);
  if (mediaDir.length === 0) {
    return {
      status: 500,
      body: { ok: false, error: "Media directory is not configured." },
    };
  }

  const publisher = createGitHubPublisher({
    token: env.token,
    owner: env.owner,
    repo: env.repo,
    branch: env.branch,
  });

  const listed = await publisher.listFiles({ path: mediaDir, contentDir: mediaDir });
  if (!listed.ok) {
    return {
      status: listed.status === 404 ? 404 : 502,
      body: { ok: false, error: listed.error },
    };
  }

  const files: MediaFileSummary[] = [];

  for (const file of listed.files) {
    const safe = safeMediaPath(file.path, mediaDir);
    if (!safe.ok) {
      continue;
    }

    const filename = filenameFromRepoPath(safe.path);
    const extension = normalizeExtension(filename);
    const kind = mediaKindFromExtension(extension);
    if (kind === null) {
      continue;
    }

    files.push({
      repoPath: safe.path,
      publicPath: joinPublicMediaPath(env.publicMediaPath, filename),
      filename,
      extension,
      kind,
      size: file.size,
    });
  }

  files.sort((left, right) => right.filename.localeCompare(left.filename));

  return {
    status: 200,
    body: { ok: true, files },
  };
}
