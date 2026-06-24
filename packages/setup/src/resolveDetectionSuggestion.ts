import type { SetupDetectionResult, SetupDetectionSuggestion } from "./detectSetup.js";

export function pickDetectionSuggestionFromResult(
  result: SetupDetectionResult,
  adapter: string | null | undefined,
): SetupDetectionSuggestion | null {
  if (!result.primary) {
    return null;
  }

  if (!adapter || result.primary.adapter === adapter) {
    return result.primary;
  }

  const alternative = result.alternatives.find(
    (candidate) => candidate.adapter === adapter,
  );
  return alternative ?? result.primary;
}

export function applySuggestionOverrides(
  suggestion: SetupDetectionSuggestion,
  overrides: { contentRoot?: string | null },
): SetupDetectionSuggestion {
  const nextRoot = overrides.contentRoot?.trim();
  if (!nextRoot || nextRoot === suggestion.contentDir) {
    return suggestion;
  }

  return {
    ...suggestion,
    contentDir: nextRoot,
    contentRoot: nextRoot,
  };
}

export function resolveDetectionSuggestion(
  result: SetupDetectionResult,
  options?: { adapter?: string | null; contentRoot?: string | null },
): SetupDetectionSuggestion | null {
  const picked = pickDetectionSuggestionFromResult(result, options?.adapter ?? null);
  if (!picked) {
    return null;
  }

  return applySuggestionOverrides(picked, {
    contentRoot: options?.contentRoot ?? null,
  });
}
