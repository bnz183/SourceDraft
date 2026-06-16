import type { PublishMode } from "@sourcedraft/publishers";
import type { ValidationIssue } from "@sourcedraft/core";
import type { ArticleFormState } from "./articleForm";
import { analyzeContentQuality } from "./contentQuality";
import { analyzeSeoFields } from "./seoValidation";

export type PublishChecklistItem = {
  id: string;
  label: string;
  value: string;
  status: "ok" | "warn" | "error";
};

export type PublishChecklist = {
  items: PublishChecklistItem[];
  warningCount: number;
};

function publishModeLabel(mode: PublishMode): string {
  if (mode === "direct") {
    return "Send directly";
  }

  if (mode === "draft-pull-request") {
    return "Draft review request";
  }

  return "Review request";
}

export function buildPublishChecklist(input: {
  valid: boolean;
  issues: ValidationIssue[];
  values: ArticleFormState;
  outputPath: string | null;
  publishMode: PublishMode;
  baseBranch: string;
  prBranchPreview: string | null;
  knownPostSlugs: string[];
}): PublishChecklist {
  const items: PublishChecklistItem[] = [];
  const quality = analyzeContentQuality(
    {
      title: input.values.title,
      description: input.values.description,
      body: input.values.body,
      heroImage: input.values.heroImage,
      metaTitle: input.values.metaTitle,
      metaDescription: input.values.metaDescription,
      socialImage: input.values.socialImage,
      coverImageAlt: input.values.coverImageAlt,
    },
    input.issues,
    { knownPostSlugs: input.knownPostSlugs },
  );
  const seo = analyzeSeoFields(input.values);

  items.push({
    id: "validation",
    label: "Validation",
    value: input.valid
      ? "Required fields complete"
      : `${input.issues.length} issue(s) to fix`,
    status: input.valid ? "ok" : "error",
  });

  items.push({
    id: "output-path",
    label: "Article file",
    value: input.outputPath ?? "—",
    status: input.outputPath ? "ok" : "warn",
  });

  items.push({
    id: "publish-mode",
    label: "How to send",
    value: publishModeLabel(input.publishMode),
    status: "ok",
  });

  items.push({
    id: "target-branch",
    label: input.publishMode === "direct" ? "Target branch" : "Base branch",
    value: input.baseBranch,
    status: "ok",
  });

  if (input.publishMode !== "direct") {
    items.push({
      id: "pr-branch",
      label: "PR branch",
      value: input.prBranchPreview ?? "—",
      status: input.prBranchPreview ? "ok" : "warn",
    });
  }

  items.push({
    id: "draft-status",
    label: "Draft status",
    value: input.values.draft ? "Draft" : "Live",
    status: "ok",
  });

  const mediaWarnings = quality.warnings.filter((warning) =>
    /image|alt|cover|social/iu.test(warning.message),
  );
  items.push({
    id: "media",
    label: "Media warnings",
    value:
      mediaWarnings.length === 0
        ? "None"
        : `${mediaWarnings.length} warning(s)`,
    status: mediaWarnings.length === 0 ? "ok" : "warn",
  });

  const seoWarnings = [
    ...seo.warnings.map((warning) => warning.message),
    ...quality.warnings
      .filter((warning) => /title|description|meta|social|link/iu.test(warning.message))
      .map((warning) => warning.message),
  ];
  items.push({
    id: "seo",
    label: "SEO warnings",
    value: seoWarnings.length === 0 ? "None" : `${seoWarnings.length} warning(s)`,
    status: seoWarnings.length === 0 ? "ok" : "warn",
  });

  const warningCount = items.filter((item) => item.status === "warn").length;

  return { items, warningCount };
}
