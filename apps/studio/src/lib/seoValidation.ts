import {
  buildSeoWarnings,
  computeReadingTimeMinutes,
  type SeoWarning,
} from "@sourcedraft/core";
import type { ArticleFormState } from "./articleForm.js";
import { formStateToArticleInput } from "./articleForm.js";

export type SeoValidationResult = {
  readingTimeMinutes: number;
  warnings: SeoWarning[];
};

export function analyzeSeoFields(state: ArticleFormState): SeoValidationResult {
  const input = formStateToArticleInput(state);

  return {
    readingTimeMinutes: computeReadingTimeMinutes(state.body),
    warnings: buildSeoWarnings(input),
  };
}
