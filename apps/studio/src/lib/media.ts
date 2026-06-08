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

export async function uploadMedia(file: File): Promise<MediaUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("/api/media/upload", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = (await response.json()) as MediaUploadResponse;

    if (!response.ok || !data.ok) {
      return data.ok
        ? {
            ok: false,
            error:
              "Media upload failed. Check token, owner/repo, and mediaDir.",
          }
        : data;
    }

    return data;
  } catch {
    return { ok: false, error: "Could not reach the upload API. Is the server running?" };
  }
}
