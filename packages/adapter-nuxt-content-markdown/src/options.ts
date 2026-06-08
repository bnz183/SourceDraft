export type FilenameConvention = "slug" | "date-slug" | "index";

export type NuxtContentMarkdownOptions = {
  filenameConvention: FilenameConvention;
  navigation: string | boolean | undefined;
};

const DEFAULT_FILENAME_CONVENTION: FilenameConvention = "slug";

export function resolveNuxtContentMarkdownOptions(
  options?: Record<string, unknown>,
): NuxtContentMarkdownOptions {
  const rawConvention = options?.filenameConvention;
  const filenameConvention =
    rawConvention === "date-slug" || rawConvention === "index"
      ? rawConvention
      : DEFAULT_FILENAME_CONVENTION;

  let navigation: string | boolean | undefined;
  if (typeof options?.navigation === "boolean") {
    navigation = options.navigation;
  } else if (
    typeof options?.navigation === "string" &&
    options.navigation.trim().length > 0
  ) {
    navigation = options.navigation.trim();
  }

  return {
    filenameConvention,
    navigation,
  };
}
