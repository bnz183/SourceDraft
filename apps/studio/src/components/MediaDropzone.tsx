import { useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import { uploadMedia } from "../lib/media";

const ACCEPTED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

type MediaDropzoneProps = {
  githubReady: boolean;
  onUseAsHero: (publicPath: string) => void;
  onInsertIntoBody: (publicPath: string) => void;
};

type UploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "success"; publicPath: string; repoPath: string }
  | { status: "error"; message: string };

export function MediaDropzone({
  githubReady,
  onUseAsHero,
  onInsertIntoBody,
}: MediaDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [upload, setUpload] = useState<UploadState>({ status: "idle" });

  const uploadDisabled = !githubReady || upload.status === "uploading";

  async function handleFile(file: File | null | undefined) {
    if (!file || uploadDisabled) {
      return;
    }

    if (!ACCEPTED_TYPES.has(file.type)) {
      setUpload({
        status: "error",
        message: "Use a PNG, JPEG, GIF, or WebP image.",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUpload({
        status: "error",
        message: "Image must be 5 MB or smaller.",
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
    });
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
        aria-label="Image upload"
        tabIndex={uploadDisabled ? -1 : 0}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        aria-disabled={uploadDisabled}
      >
        <p className="media-dropzone__label">
          Drop an image here or choose a file
        </p>
        <p className="media-dropzone__hint">
          PNG, JPEG, GIF, or WebP · 5 MB max. Files upload to your repository
          through the server.
        </p>
        {!githubReady && (
          <p className="media-dropzone__hint media-dropzone__hint--warning" role="status">
            Configure GitHub in Settings before uploading images.
          </p>
        )}
        <button
          type="button"
          className="button button--compact"
          disabled={uploadDisabled}
          aria-describedby={uploadDisabled ? "upload-disabled-reason" : undefined}
          onClick={() => inputRef.current?.click()}
        >
          {upload.status === "uploading" ? "Uploading…" : "Choose image"}
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
          accept="image/png,image/jpeg,image/gif,image/webp"
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
            Image ready at{" "}
            <code className="media-dropzone__path">{upload.publicPath}</code>
          </p>
          <p className="media-dropzone__hint">
            Use this path in your cover image field or body Markdown.
          </p>
          <div className="media-dropzone__actions">
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
                onInsertIntoBody(upload.publicPath);
              }}
            >
              Insert into article
            </button>
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
