import { useRef, useState, type DragEvent } from "react";
import { uploadMedia } from "../lib/media";

const ACCEPTED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
]);

type MediaDropzoneProps = {
  mediaDir: string;
  onUseAsHero: (publicPath: string) => void;
  onInsertIntoBody: (publicPath: string) => void;
};

type UploadState =
  | { status: "idle" }
  | { status: "uploading" }
  | { status: "success"; publicPath: string; repoPath: string }
  | { status: "error"; message: string };

export function MediaDropzone({
  mediaDir,
  onUseAsHero,
  onInsertIntoBody,
}: MediaDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [upload, setUpload] = useState<UploadState>({ status: "idle" });

  async function handleFile(file: File | null | undefined) {
    if (!file) {
      return;
    }

    if (!ACCEPTED_TYPES.has(file.type)) {
      setUpload({
        status: "error",
        message: "Choose a PNG, JPEG, GIF, or WebP image.",
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
    setDragActive(true);
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
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className="media-dropzone__label">Drop an image here</p>
        <p className="media-dropzone__hint">
          PNG, JPEG, GIF, or WebP up to 5 MB. Uploads go to{" "}
          <code>{mediaDir}</code> through the server — your GitHub token never
          leaves the API.
        </p>
        <button
          type="button"
          className="button button--compact"
          disabled={upload.status === "uploading"}
          onClick={() => inputRef.current?.click()}
        >
          {upload.status === "uploading" ? "Uploading..." : "Choose image"}
        </button>
        <input
          ref={inputRef}
          className="media-dropzone__input"
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          onChange={(event) => {
            void handleFile(event.target.files?.item(0));
          }}
        />
      </div>

      {upload.status === "error" && (
        <p className="media-dropzone__message media-dropzone__message--error">
          {upload.message}
        </p>
      )}

      {upload.status === "success" && (
        <div className="media-dropzone__result">
          <p className="media-dropzone__message media-dropzone__message--success">
            Uploaded <code>{upload.publicPath}</code>
          </p>
          <div className="media-dropzone__actions">
            <button
              type="button"
              className="button button--compact"
              onClick={() => {
                onUseAsHero(upload.publicPath);
              }}
            >
              Use as hero image
            </button>
            <button
              type="button"
              className="button button--compact"
              onClick={() => {
                onInsertIntoBody(upload.publicPath);
              }}
            >
              Insert into body
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
