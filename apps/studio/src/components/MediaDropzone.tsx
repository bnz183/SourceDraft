import { useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import {
  CLIENT_ACCEPTED_TYPES,
  clientMaxBytesForFile,
  clientMediaKindForFile,
  uploadMedia,
} from "../lib/media";

type MediaDropzoneProps = {
  githubReady: boolean;
  onUseAsHero: (publicPath: string) => void;
  onInsertImage: (publicPath: string) => void;
  onInsertPdfLink: (publicPath: string, filename: string) => void;
  onUploadSuccess?: (publicPath: string) => void;
  onUploaded?: () => void;
};

type UploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | {
      status: "success";
      publicPath: string;
      repoPath: string;
      kind: "image" | "pdf";
      filename: string;
    }
  | { status: "error"; message: string };

const ACCEPT_ATTRIBUTE = CLIENT_ACCEPTED_TYPES.join(",");

export function MediaDropzone({
  githubReady,
  onUseAsHero,
  onInsertImage,
  onInsertPdfLink,
  onUploadSuccess,
  onUploaded,
}: MediaDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [upload, setUpload] = useState<UploadState>({ status: "idle" });

  const uploadDisabled = !githubReady || upload.status === "uploading";

  async function handleFile(file: File | null | undefined) {
    if (!file || uploadDisabled) {
      return;
    }

    const kind = clientMediaKindForFile(file);
    if (kind === null) {
      setUpload({
        status: "error",
        message: "Use a PNG, JPEG, GIF, WebP image, or PDF document.",
      });
      return;
    }

    const maxBytes = clientMaxBytesForFile(file);
    if (file.size > maxBytes) {
      setUpload({
        status: "error",
        message:
          kind === "pdf"
            ? "PDF must be 10 MB or smaller."
            : "Image must be 5 MB or smaller.",
      });
      return;
    }

    setUpload({ status: "uploading" });

    const result = await uploadMedia(file);
    if (!result.ok) {
      setUpload({ status: "error", message: result.error });
      return;
    }

    setUpload({
      status: "success",
      publicPath: result.publicPath,
      repoPath: result.repoPath,
      kind: result.kind,
      filename: file.name,
    });
    if (result.kind === "image") {
      onUploadSuccess?.(result.publicPath);
    }
    onUploaded?.();
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!uploadDisabled) {
      setDragActive(true);
    }
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    void handleFile(event.dataTransfer.files.item(0));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (uploadDisabled) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputRef.current?.click();
    }
  }

  function resetUpload() {
    setUpload({ status: "idle" });
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  return (
    <div className="media-dropzone">
      <div
        className={
          dragActive
            ? "media-dropzone__target media-dropzone__target--active"
            : "media-dropzone__target"
        }
        role="group"
        aria-label="Media upload"
        tabIndex={uploadDisabled ? -1 : 0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        aria-disabled={uploadDisabled}
      >
        <p className="media-dropzone__label">
          Drop a file here or choose one to upload
        </p>
        <p className="media-dropzone__hint">
          PNG, JPEG, GIF, WebP (5 MB max) · PDF (10 MB max). Files upload to
          your repository through the server.
        </p>
        {!githubReady && (
          <p className="media-dropzone__hint media-dropzone__hint--warning" role="status">
            Configure GitHub in Settings before uploading media.
          </p>
        )}
        <button
          type="button"
          className="button button--compact"
          disabled={uploadDisabled}
          aria-describedby={uploadDisabled ? "upload-disabled-reason" : undefined}
          onClick={() => inputRef.current?.click()}
        >
          {upload.status === "uploading" ? "Uploading…" : "Choose file"}
        </button>
        {uploadDisabled && githubReady === false && (
          <span id="upload-disabled-reason" className="visually-hidden">
            GitHub owner and repository are not configured
          </span>
        )}
        <input
          ref={inputRef}
          id="media-upload-input"
          className="media-dropzone__input"
          type="file"
          accept={ACCEPT_ATTRIBUTE}
          disabled={uploadDisabled}
          onChange={(event) => {
            void handleFile(event.target.files?.item(0));
          }}
        />
      </div>

      {upload.status === "error" && (
        <p
          className="media-dropzone__message media-dropzone__message--error"
          role="alert"
        >
          {upload.message}
        </p>
      )}

      {upload.status === "success" && (
        <div className="media-dropzone__result">
          <p className="media-dropzone__message media-dropzone__message--success">
            {upload.kind === "image" ? "Image" : "PDF"} ready at{" "}
            <code className="media-dropzone__path">{upload.publicPath}</code>
          </p>
          <p className="media-dropzone__hint">
            Use this path in your cover field, body Markdown, or media library.
          </p>
          <div className="media-dropzone__actions">
            {upload.kind === "image" ? (
              <>
                <button
                  type="button"
                  className="button button--compact button--primary"
                  onClick={() => {
                    onUseAsHero(upload.publicPath);
                  }}
                >
                  Use as cover image
                </button>
                <button
                  type="button"
                  className="button button--compact"
                  onClick={() => {
                    onInsertImage(upload.publicPath);
                  }}
                >
                  Insert into article
                </button>
              </>
            ) : (
              <button
                type="button"
                className="button button--compact button--primary"
                onClick={() => {
                  onInsertPdfLink(upload.publicPath, upload.filename);
                }}
              >
                Insert PDF link
              </button>
            )}
            <button
              type="button"
              className="button button--compact"
              onClick={resetUpload}
            >
              Upload another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
