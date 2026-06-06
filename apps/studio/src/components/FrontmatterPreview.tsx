import { buildFrontmatterPreview } from "../lib/frontmatterPreview";
import type { ArticleFormState } from "../lib/articleForm";

type FrontmatterPreviewProps = {
  form: ArticleFormState;
};

export function FrontmatterPreview({ form }: FrontmatterPreviewProps) {
  const preview = buildFrontmatterPreview(form);

  return (
    <section className="panel frontmatter-preview">
      <div className="panel__header">
        <h2 className="panel__title">Frontmatter preview</h2>
        <p className="panel__meta">Live MDX output shape</p>
      </div>

      <pre className="frontmatter-preview__code">
        <code>{preview}</code>
      </pre>
    </section>
  );
}
