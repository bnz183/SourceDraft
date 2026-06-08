import type {
  MediaProvider,
  MediaProviderFactory,
  MediaProviderRuntimeConfig,
  MediaUploadInput,
  MediaUploadResult,
} from "./types.js";

function createGitHubMediaProvider(config: MediaProviderRuntimeConfig): MediaProvider {
  return {
    id: "github-media",
    async uploadMedia(input: MediaUploadInput): Promise<MediaUploadResult> {
      if (!config.publisherUpload) {
        return {
          ok: false,
          error:
            "GitHub media provider requires a configured git publisher with upload support.",
        };
      }

      const result = await config.publisherUpload({
        repoPath: input.repoPath,
        contentBase64: input.buffer.toString("base64"),
        message: input.message,
      });

      if (!result.ok) {
        return {
          ok: false,
          error: result.error,
          ...(result.status !== undefined ? { status: result.status } : {}),
        };
      }

      return {
        ok: true,
        url: input.publicPath,
        path: result.path,
        provider: "github-media",
        sha: result.sha,
        commitSha: result.commitSha,
        metadata: {
          publicPath: input.publicPath,
        },
      };
    },
  };
}

export const githubMediaProviderFactory: MediaProviderFactory = {
  id: "github-media",
  createProvider(config: MediaProviderRuntimeConfig): MediaProvider {
    return createGitHubMediaProvider(config);
  },
};
