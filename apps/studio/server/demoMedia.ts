import { randomBytes } from "node:crypto";
import type { Request } from "express";
import Busboy from "busboy";
import { joinPublicMediaPath } from "@sourcedraft/config";
import type { PublishEnvConfig } from "./config.js";
import { addDemoMedia, demoCommitSha, listDemoMedia } from "./demoStore.js";
import type { ListMediaResponse } from "./listMedia.js";
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
import type { MediaUploadResponse } from "./media.js";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

type ParsedUpload = {
  buffer: Buffer;
  filename: string;
  mimeType: string;
};

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

export async function listDemoMediaHandler(): Promise<{
  status: number;
  body: ListMediaResponse;
}> {
  return {
    status: 200,
    body: { ok: true, files: listDemoMedia() },
  };
}

export async function uploadDemoMedia(
  req: Request,
  env: Omit<PublishEnvConfig, "token">,
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

  const extension = extensionForMime(parsed.mimeType) ?? "bin";
  const uniqueSuffix = randomBytes(4).toString("hex");
  const repoFilename = `upload-${uniqueSuffix}.${extension}`;
  const repoPath = `${mediaDir}/${repoFilename}`;
  const publicPath = joinPublicMediaPath(env.publicMediaPath, repoFilename);
  const commitSha = demoCommitSha();

  addDemoMedia({
    repoPath,
    publicPath,
    filename: repoFilename,
    extension,
    kind,
    size: parsed.buffer.length,
  });

  return {
    status: 200,
    body: {
      ok: true,
      repoPath,
      publicPath,
      kind,
      sha: commitSha,
      commitSha,
    },
  };
}
