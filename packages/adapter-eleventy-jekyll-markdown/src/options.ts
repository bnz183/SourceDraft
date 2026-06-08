export type EleventyJekyllMarkdownOptions = {
  layout: string;
  jekyllFilename: boolean;
  permalinkPrefix: string;
};

const DEFAULT_LAYOUT = "post";
const DEFAULT_PERMALINK_PREFIX = "/";

export function resolveEleventyJekyllOptions(
  options?: Record<string, unknown>,
): EleventyJekyllMarkdownOptions {
  const layout =
    typeof options?.layout === "string" && options.layout.trim().length > 0
      ? options.layout.trim()
      : DEFAULT_LAYOUT;

  const permalinkPrefix =
    typeof options?.permalinkPrefix === "string" &&
    options.permalinkPrefix.trim().length > 0
      ? options.permalinkPrefix.trim()
      : DEFAULT_PERMALINK_PREFIX;

  return {
    layout,
    jekyllFilename: options?.jekyllFilename === true,
    permalinkPrefix,
  };
}
