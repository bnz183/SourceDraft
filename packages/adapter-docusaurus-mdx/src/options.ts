export type FilenameConvention = "slug" | "date-slug" | "index";

export type DocusaurusMdxOptions = {
  filenameConvention: FilenameConvention;
  hideTableOfContents: boolean;
};

const DEFAULT_FILENAME_CONVENTION: FilenameConvention = "slug";

export function resolveDocusaurusMdxOptions(
  options?: Record<string, unknown>,
): DocusaurusMdxOptions {
  const rawConvention = options?.filenameConvention;
  const filenameConvention =
    rawConvention === "date-slug" || rawConvention === "index"
      ? rawConvention
      : DEFAULT_FILENAME_CONVENTION;

  return {
    filenameConvention,
    hideTableOfContents: options?.hideTableOfContents === true,
  };
}
