import { randomBytes } from "node:crypto";
import type { Request } from "express";
import Busboy from "busboy";
import { joinPublicMediaPath } from "@sourcedraft/config";
import type { PublishEnvConfig } from "./config.js";
import { createMediaProviderFromEnv } from "./mediaProviderRuntime.js";
import { normalizeMediaDir } from "./mediaPaths.js";
import {
  ALLOWED_MIME_TYPES,
  allowedTypesMessage,
  extensionForMime,
  matchesMediaSignature,
  maxBytesForMime,
  mediaKindFromMime,
  uploadLimitMessage,
} from "./mediaValidation.js";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

type ParsedUpload = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
};

export type MediaUploadSuccess = {
  ok: true;
  repoPath: string;
  publicPath: string;
  kind: "image" | "pdf";
  url: string;
  provider: string;
  sha: string;
  commitSha: string;
  metadata?: Record<string, unknown>;
};

export type MediaUploadError = {
  ok: false;
  error: string;
};

export type MediaUploadResponse = MediaUploadSuccess | MediaUploadError;

function sanitizeFilename(filename: string): string {
  const base = filename.split(/[/\\]/u).pop() ?? "upload";
  const cleaned = base
    .replace(/[^a-zA-Z0-9._-]+/gu, "-")
    .replace(/-+/gu, "-")
    .replace(/^-+|-+$/gu, "");

  if (cleaned.length === 0) {
    return "upload";
  }

  return cleaned.slice(0, 120);
}

function parseUpload(req: Request): Promise<ParsedUpload> {
  return new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: req.headers,
      limits: {
        files: 1,
        fileSize: MAX_UPLOAD_BYTES,
      },
    });

    let upload: ParsedUpload | null = null;
    let rejected = false;

    busboy.on("file", (fieldName, stream, info) => {
      if (fieldName !== "file") {
        stream.resume();
        return;
      }

      if (upload !== null) {
        stream.resume();
        return;
      }

      const chunks: Buffer[] = [];
      upload = {
        buffer: Buffer.alloc(0),
        filename: info.filename,
        mimeType: info.mimeType,
      };

      stream.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      stream.on("limit", () => {
        rejected = true;
        reject(new Error("File exceeds the maximum upload limit."));
      });

      stream.on("end", () => {
        if (upload !== null) {
          upload.buffer = Buffer.concat(chunks);
        }
      });
    });

    busboy.on("finish", () => {
      if (rejected) {
        return;
      }

      if (upload === null) {
        reject(new Error('Upload requires a multipart field named "file".'));
        return;
      }

      resolve(upload);
    });

    busboy.on("error", (error) => {
      reject(error);
    });

    req.pipe(busboy);
  });
}

function buildUploadFilename(originalName: string, mimeType: string): string {
  const sanitized = sanitizeFilename(originalName);
  const extension = extensionForMime(mimeType);
  if (extension === null) {
    return sanitized;
  }

  const withoutExtension = sanitized.replace(/\.[^.]+$/u, "");
  const base = withoutExtension.length > 0 ? withoutExtension : sanitized;
  return `${base}.${extension}`;
}

export async function uploadMedia(
  req: Request,
  env: PublishEnvConfig,
): Promise<{ status: number; body: MediaUploadResponse }> {
  const mediaDir = normalizeMediaDir(env.mediaDir);
  if (mediaDir.length === 0) {
    return {
      status: 500,
      body: { ok: false, error: "Media directory is not configured." },
    };
  }

  let parsed: ParsedUpload;
  try {
    parsed = await parseUpload(req);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not parse upload.";
    return {
      status: 400,
      body: { ok: false, error: message },
    };
  }

  if (parsed.buffer.length === 0) {
    return {
      status: 400,
      body: { ok: false, error: "Uploaded file is empty." },
    };
  }

  if (!ALLOWED_MIME_TYPES.has(parsed.mimeType)) {
    return {
      status: 400,
      body: { ok: false, error: allowedTypesMessage() },
    };
  }

  const kind = mediaKindFromMime(parsed.mimeType);
  const maxBytes = maxBytesForMime(parsed.mimeType);
  if (kind === null || maxBytes === null) {
    return {
      status: 400,
      body: { ok: false, error: allowedTypesMessage() },
    };
  }

  if (parsed.buffer.length > maxBytes) {
    return {
      status: 400,
      body: { ok: false, error: uploadLimitMessage(parsed.mimeType) },
    };
  }

  if (!matchesMediaSignature(parsed.buffer, parsed.mimeType)) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "File content does not match the declared file type.",
      },
    };
  }

  const filename = buildUploadFilename(parsed.filename, parsed.mimeType);
  const uniqueSuffix = randomBytes(4).toString("hex");
  const repoFilename = filename.replace(/(\.[^.]+)$/u, `-${uniqueSuffix}$1`);
  const repoPath = `${mediaDir}/${repoFilename}`;
  const publicPath = joinPublicMediaPath(env.publicMediaPath, repoFilename);

  const mediaProvider = createMediaProviderFromEnv(env);

  const result = await mediaProvider.uploadMedia({
    buffer: parsed.buffer,
    filename: repoFilename,
    mimeType: parsed.mimeType,
    repoPath,
    publicPath,
    message: `Upload media: ${repoFilename}`,
  });

  if (!result.ok) {
    return {
      status: 502,
      body: {
        ok: false,
        error: result.error || "Media upload failed.",
      },
    };
  }

  const displayPath =
    result.provider === "github-media" ? publicPath : result.url || publicPath;

  return {
    status: 200,
    body: {
      ok: true,
      repoPath: result.path,
      publicPath: displayPath,
      kind,
      url: result.url,
      provider: result.provider,
      sha: result.sha ?? result.path,
      commitSha: result.commitSha ?? result.path,
      ...(result.metadata !== undefined ? { metadata: result.metadata } : {}),
    },
  };
}
