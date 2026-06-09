import { useMemo, useState } from "react";
import { analyzeDocumentOutline } from "../lib/documentOutline.js";

type DocumentOutlineProps = {
  body: string;
  onScrollToOffset?: (offset: number) => void;
};

function headingLabel(level: 1 | 2 | 3): string {
  return `H${level}`;
}

export function DocumentOutline({ body, onScrollToOffset }: DocumentOutlineProps) {
  const [open, setOpen] = useState(true);
  const analysis = useMemo(() => analyzeDocumentOutline(body), [body]);

  return (
    <section className="document-outline" aria-labelledby="document-outline-title">
      <div className="document-outline__header">
        <h3 className="document-outline__title" id="document-outline-title">
          Document outline
        </h3>
        <button
          type="button"
          className="button button--compact"
          aria-expanded={open}
          onClick={() => {
            setOpen((current) => !current);
          }}
        >
          {open ? "Hide" : "Show"}
        </button>
      </div>

      {open && (
        <div className="document-outline__body">
          {analysis.headings.length === 0 ? (
            <p className="document-outline__empty" role="status">
              No H1–H3 headings found in the body yet.
            </p>
          ) : (
            <ul className="document-outline__list" role="list">
              {analysis.headings.map((heading) => (
                <li key={`${heading.startOffset}-${heading.text}`}>
                  <button
                    type="button"
                    className={`document-outline__item document-outline__item--h${heading.level}`}
                    onClick={() => {
                      onScrollToOffset?.(heading.startOffset);
                    }}
                  >
                    <span className="document-outline__level">
                      {headingLabel(heading.level)}
                    </span>
                    <span className="document-outline__text">{heading.text}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {analysis.h1Count > 1 && (
            <p className="document-outline__warning" role="status">
              {analysis.h1Count} H1 headings detected. One title-level heading is
              usually enough.
            </p>
          )}

          {analysis.headings.length > 0 && !analysis.hasSubheading && (
            <p className="document-outline__warning" role="status">
              No H2 or H3 sections yet. Longer articles often use subheadings.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
