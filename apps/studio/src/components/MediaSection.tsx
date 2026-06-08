import { useState } from "react";
import { MediaDropzone } from "./MediaDropzone";
import { MediaLibrary } from "./MediaLibrary";

type MediaSectionProps = {
  githubReady: boolean;
  onUseAsHero: (publicPath: string) => void;
  onInsertImage: (publicPath: string) => void;
  onInsertPdfLink: (publicPath: string, filename: string) => void;
  onUploadSuccess?: (publicPath: string) => void;
};

export function MediaSection({
  githubReady,
  onUseAsHero,
  onInsertImage,
  onInsertPdfLink,
  onUploadSuccess,
}: MediaSectionProps) {
  const [libraryRefreshKey, setLibraryRefreshKey] = useState(0);

  return (
    <div className="media-section">
      <MediaDropzone
        githubReady={githubReady}
        onUseAsHero={onUseAsHero}
        onInsertImage={onInsertImage}
        onInsertPdfLink={onInsertPdfLink}
        onUploadSuccess={onUploadSuccess}
        onUploaded={() => {
          setLibraryRefreshKey((current) => current + 1);
        }}
      />
      <MediaLibrary
        githubReady={githubReady}
        refreshKey={libraryRefreshKey}
        onUseAsHero={onUseAsHero}
        onInsertImage={onInsertImage}
        onInsertPdfLink={onInsertPdfLink}
      />
    </div>
  );
}
