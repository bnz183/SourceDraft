import { useMemo } from "react";
import type { PublishMode } from "@sourcedraft/publishers";
import type { ValidationIssue } from "@sourcedraft/core";
import type { ArticleFormState } from "../lib/articleForm";
import { buildPublishChecklist } from "../lib/publishChecklist.js";

type PublishChecklistProps = {
  valid: boolean;
  issues: ValidationIssue[];
  values: ArticleFormState;
  outputPath: string | null;
  publishMode: PublishMode;
  baseBranch: string;
  prBranchPreview: string | null;
  knownPostSlugs: string[];
};

export function PublishChecklist({
  valid,
  issues,
  values,
  outputPath,
  publishMode,
  baseBranch,
  prBranchPreview,
  knownPostSlugs,
}: PublishChecklistProps) {
  const checklist = useMemo(
    () =>
      buildPublishChecklist({
        valid,
        issues,
        values,
        outputPath,
        publishMode,
        baseBranch,
        prBranchPreview,
        knownPostSlugs,
      }),
    [
      valid,
      issues,
      values,
      outputPath,
      publishMode,
      baseBranch,
      prBranchPreview,
      knownPostSlugs,
    ],
  );

  return (
    <div className="publish-checklist" aria-labelledby="publish-checklist-title">
      <h3 className="publish-checklist__title" id="publish-checklist-title">
        Before you send
      </h3>
      <ul className="publish-checklist__list">
        {checklist.items.map((item) => (
          <li
            key={item.id}
            className={`publish-checklist__item publish-checklist__item--${item.status}`}
          >
            <span className="publish-checklist__label">{item.label}</span>
            <span className="publish-checklist__value">{item.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
