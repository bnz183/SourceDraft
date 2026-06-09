/**
 * Example SourceDraft plugin — registers a plain-text (.txt) adapter.
 * Add to sourcedraft.config.json:
 *   "plugins": ["./examples/plugins/plain-text-adapter/index.js"],
 *   "adapter": "plain-text"
 */

export const manifest = {
  name: "plain-text-adapter",
  version: "1.0.0",
  requiresSourceDraft: "0.0.1",
  description: "Writes articles as simple .txt files with a title line and body.",
};

export function setup(context) {
  context.registerAdapter({
    id: "plain-text",
    previewMeta: {
      label: "Plain text preview",
      extension: "txt",
    },
    render(article) {
      const lines = [article.title, "", article.description, "", article.body];
      if (article.updatedDate) {
        lines.push("", `Updated: ${article.updatedDate}`);
      }
      return `${lines.join("\n").trimEnd()}\n`;
    },
    getPath(article, config) {
      return `${config.contentDir}/${article.slug}.txt`;
    },
    fromFrontmatter(path, frontmatter, body, slugFromPathFn) {
      const slug =
        typeof frontmatter.slug === "string" && frontmatter.slug.trim().length > 0
          ? frontmatter.slug.trim()
          : slugFromPathFn(path);

      return {
        title: typeof frontmatter.title === "string" ? frontmatter.title : slug,
        slug,
        description:
          typeof frontmatter.description === "string" ? frontmatter.description : "",
        pubDate:
          typeof frontmatter.pubDate === "string"
            ? frontmatter.pubDate
            : new Date().toISOString().slice(0, 10),
        category:
          typeof frontmatter.category === "string" ? frontmatter.category : "Guides",
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        draft: frontmatter.draft === true,
        body,
      };
    },
  });
}
