import { useMemo } from "react";
import type { ValidationIssue } from "@sourcedraft/core";
import type { ArticleFormState } from "../lib/articleForm";
import { analyzeContentQuality } from "../lib/contentQuality.js";

type ContentQualityPanelProps = {
  values: ArticleFormState;
  validationIssues: ValidationIssue[];
};

function metricLabel(value: string | number, suffix = ""): string {
  return `${value}${suffix}`;
}

export function ContentQualityPanel({
  values,
  validationIssues,
}: ContentQualityPanelProps) {
  const analysis = useMemo(
    () =>
      analyzeContentQuality(
        {
          title: values.title,
          description: values.description,
          body: values.body,
          heroImage: values.heroImage,
        },
        validationIssues,
      ),
    [values, validationIssues],
  );

  const { metrics, warnings } = analysis;
  const guidanceWarnings = warnings.filter((warning) => warning.kind === "info");
  const issueWarnings = warnings.filter((warning) => warning.kind === "warn");

  return (
    <section
      className="content-quality"
      aria-labelledby="content-quality-title"
    >
      <div className="content-quality__header">
        <h3 className="content-quality__title" id="content-quality-title">
          Content quality
        </h3>
        <p className="content-quality__hint">
          Editorial checks for this draft. Guidance only — not a ranking score.
        </p>
      </div>

      <dl className="content-quality__metrics">
        <div className="content-quality__metric">
          <dt>Words</dt>
          <dd>{metricLabel(metrics.wordCount)}</dd>
        </div>
        <div className="content-quality__metric">
          <dt>Reading time</dt>
          <dd>
            {metrics.readingTimeMinutes === 0
              ? "—"
              : metricLabel(metrics.readingTimeMinutes, " min")}
          </dd>
        </div>
        <div className="content-quality__metric">
          <dt>Title length</dt>
          <dd>{metricLabel(metrics.titleLength, " chars")}</dd>
        </div>
        <div className="content-quality__metric">
          <dt>Description length</dt>
          <dd>{metricLabel(metrics.descriptionLength, " chars")}</dd>
        </div>
        <div className="content-quality__metric">
          <dt>Cover image</dt>
          <dd>{metrics.hasCoverImage ? "Set" : "Not set"}</dd>
        </div>
        <div className="content-quality__metric">
          <dt>Body heading</dt>
          <dd>{metrics.hasHeading ? "Present" : "None detected"}</dd>
        </div>
        <div className="content-quality__metric">
          <dt>Links</dt>
          <dd>
            {metrics.internalLinkCount} internal · {metrics.externalLinkCount}{" "}
            external
          </dd>
        </div>
        <div className="content-quality__metric">
          <dt>Images</dt>
          <dd>
            {metrics.imageCount}
            {metrics.imagesMissingAlt > 0
              ? ` (${metrics.imagesMissingAlt} missing alt)`
              : ""}
          </dd>
        </div>
      </dl>

      {issueWarnings.length > 0 && (
        <div className="content-quality__warnings" role="status">
          <p className="content-quality__warnings-title">Needs attention</p>
          <ul className="content-quality__warnings-list">
            {issueWarnings.map((warning) => (
              <li key={warning.id}>{warning.message}</li>
            ))}
          </ul>
        </div>
      )}

      {guidanceWarnings.length > 0 && (
        <div className="content-quality__guidance" role="status">
          <p className="content-quality__warnings-title">Suggestions</p>
          <ul className="content-quality__warnings-list">
            {guidanceWarnings.map((warning) => (
              <li key={warning.id}>{warning.message}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length === 0 && (
        <p className="content-quality__ok" role="status">
          No issues detected in current checks.
        </p>
      )}
    </section>
  );
}
