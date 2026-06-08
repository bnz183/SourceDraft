import { useCallback, useEffect, useState } from "react";
import {
  copyTextToClipboard,
  fetchMediaLibrary,
  formatMediaSize,
  type MediaFile,
} from "../lib/media.js";

type MediaLibraryProps = {
  githubReady: boolean;
  refreshKey: number;
  onUseAsHero: (publicPath: string) => void;
  onInsertImage: (publicPath: string) => void;
  onInsertPdfLink: (publicPath: string, filename: string) => void;
};

export function MediaLibrary({
  githubReady,
  refreshKey,
  onUseAsHero,
  onInsertImage,
  onInsertPdfLink,
}: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const loadLibrary = useCallback(async () => {
    if (!githubReady) {
      setFiles([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await fetchMediaLibrary();
    if (!result.ok) {
      setFiles([]);
      setError(result.error);
    } else {
      setFiles(result.files);
    }

    setLoading(false);
  }, [githubReady]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadLibrary();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadLibrary, refreshKey]);

  async function handleCopy(publicPath: string) {
    const copied = await copyTextToClipboard(publicPath);
    if (copied) {
      setCopiedPath(publicPath);
      window.setTimeout(() => {
        setCopiedPath((current) => (current === publicPath ? null : current));
      }, 2000);
    }
  }

  return (
    <section className="media-library" aria-labelledby="media-library-title">
      <div className="media-library__header">
        <h3 className="media-library__title" id="media-library-title">
          Media library
        </h3>
        <button
          type="button"
          className="button button--compact"
          disabled={!githubReady || loading}
          aria-label="Refresh media library"
          onClick={() => {
            void loadLibrary();
          }}
        >
          Refresh
        </button>
      </div>

      {!githubReady && (
        <p className="media-library__hint" role="status">
          Configure GitHub in Settings to browse uploaded files.
        </p>
      )}

      {githubReady && loading && (
        <p className="media-library__status" role="status">
          Loading media files…
        </p>
      )}

      {githubReady && error && (
        <p className="media-library__error" role="alert">
          {error}
        </p>
      )}

      {githubReady && !loading && !error && files.length === 0 && (
        <p className="media-library__empty" role="status">
          No media files yet. Upload an image or PDF above.
        </p>
      )}

      {githubReady && !loading && !error && files.length > 0 && (
        <ul className="media-library__list" role="list">
          {files.map((file) => (
            <li key={file.repoPath} className="media-library__item">
              <div className="media-library__item-main">
                <span className="media-library__kind">
                  {file.kind === "image" ? "Image" : "PDF"}
                </span>
                <span className="media-library__filename">{file.filename}</span>
                <code className="media-library__path">{file.publicPath}</code>
                <span className="media-library__size">
                  {formatMediaSize(file.size)}
                </span>
              </div>
              <div className="media-library__actions">
                <button
                  type="button"
                  className="button button--compact"
                  aria-label={`Copy public path for ${file.filename}`}
                  onClick={() => {
                    void handleCopy(file.publicPath);
                  }}
                >
                  {copiedPath === file.publicPath ? "Copied" : "Copy path"}
                </button>
                {file.kind === "image" ? (
                  <>
                    <button
                      type="button"
                      className="button button--compact"
                      aria-label={`Insert ${file.filename} into article body`}
                      onClick={() => {
                        onInsertImage(file.publicPath);
                      }}
                    >
                      Insert image
                    </button>
                    <button
                      type="button"
                      className="button button--compact"
                      aria-label={`Use ${file.filename} as cover image`}
                      onClick={() => {
                        onUseAsHero(file.publicPath);
                      }}
                    >
                      Use as cover
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="button button--compact"
                    aria-label={`Insert link to ${file.filename}`}
                    onClick={() => {
                      onInsertPdfLink(file.publicPath, file.filename);
                    }}
                  >
                    Insert link
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
