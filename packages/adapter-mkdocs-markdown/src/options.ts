export type FilenameConvention = "slug" | "date-slug" | "index";

export type MkdocsMarkdownOptions = {
  filenameConvention: FilenameConvention;
  navSection: string | undefined;
};

const DEFAULT_FILENAME_CONVENTION: FilenameConvention = "slug";

export function resolveMkdocsMarkdownOptions(
  options?: Record<string, unknown>,
): MkdocsMarkdownOptions {
  const rawConvention = options?.filenameConvention;
  const filenameConvention =
    rawConvention === "date-slug" || rawConvention === "index"
      ? rawConvention
      : DEFAULT_FILENAME_CONVENTION;

  const navSection =
    typeof options?.navSection === "string" && options.navSection.trim().length > 0
      ? options.navSection.trim()
      : undefined;

  return {
    filenameConvention,
    navSection,
  };
}

export function buildMkdocsNavHint(
  title: string,
  repoPath: string,
  navSection: string | undefined,
): string {
  const entry = `${title}: ${repoPath}`;
  if (navSection !== undefined) {
    return `Add under "${navSection}" in mkdocs.yml nav: ${entry}`;
  }

  return `Add to mkdocs.yml nav manually: ${entry}`;
}
