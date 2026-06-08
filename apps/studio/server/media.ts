import { randomBytes } from "node:crypto";
import type { Request } from "express";
import Busboy from "busboy";
import { joinPublicMediaPath } from "@sourcedraft/config";
import { createGitHubPublisher } from "@sourcedraft/github-publisher";
import type { PublishEnvConfig } from "./config.js";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

type ParsedUpload = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
};

export type MediaUploadSuccess = {
  ok: true;
  repoPath: string;
  publicPath: string;
  sha: string;
  commitSha: string;
};

export type MediaUploadError = {
  ok: false;
  error: string;
};

export type MediaUploadResponse = MediaUploadSuccess | MediaUploadError;

function normalizeMediaDir(mediaDir: string): string {
  return mediaDir.replace(/^\/+/u, "").replace(/\/+$/u, "").trim();
}

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

function extensionForMime(mimeType: string): string | null {
  switch (mimeType) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/gif":
      return "gif";
    case "image/webp":
      return "webp";
    default:
      return null;
  }
}

function matchesSignature(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 12) {
    return false;
  }

  switch (mimeType) {
    case "image/png":
      return (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
      );
    case "image/jpeg":
      return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    case "image/gif":
      return (
        buffer.toString("ascii", 0, 3) === "GIF" &&
        (buffer.toString("ascii", 3, 6) === "87a" ||
          buffer.toString("ascii", 3, 6) === "89a")
      );
    case "image/webp":
      return (
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP"
      );
    default:
      return false;
  }
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
        reject(new Error("File exceeds the 5MB upload limit."));
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

  if (parsed.buffer.length > MAX_UPLOAD_BYTES) {
    return {
      status: 400,
      body: { ok: false, error: "File exceeds the 5MB upload limit." },
    };
  }

  if (!ALLOWED_MIME_TYPES.has(parsed.mimeType)) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Only PNG, JPEG, GIF, and WebP uploads are allowed.",
      },
    };
  }

  if (!matchesSignature(parsed.buffer, parsed.mimeType)) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "File content does not match the declared image type.",
      },
    };
  }

  const filename = buildUploadFilename(parsed.filename, parsed.mimeType);
  const uniqueSuffix = randomBytes(4).toString("hex");
  const repoFilename = filename.replace(
    /(\.[^.]+)$/u,
    `-${uniqueSuffix}$1`,
  );
  const repoPath = `${mediaDir}/${repoFilename}`;
  const publicPath = joinPublicMediaPath(env.publicMediaPath, repoFilename);

  const publisher = createGitHubPublisher({
    token: env.token,
    owner: env.owner,
    repo: env.repo,
    branch: env.branch,
  });

  const result = await publisher.publishFile({
    path: repoPath,
    contentBase64: parsed.buffer.toString("base64"),
    message: `Upload media: ${repoFilename}`,
  });

  if (!result.ok) {
    return {
      status: 502,
      body: { ok: false, error: result.error },
    };
  }

  return {
    status: 200,
    body: {
      ok: true,
      repoPath: result.path,
      publicPath,
      sha: result.sha,
      commitSha: result.commitSha,
    },
  };
}
