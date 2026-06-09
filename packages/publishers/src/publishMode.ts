export const PUBLISH_MODES = [
  "direct",
  "pull-request",
  "draft-pull-request",
] as const;

export type PublishMode = (typeof PUBLISH_MODES)[number];

export function isPublishMode(value: string): value is PublishMode {
  return (PUBLISH_MODES as readonly string[]).includes(value);
}

export function parsePublishMode(value: unknown): PublishMode | null {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return isPublishMode(normalized) ? normalized : null;
}

export function isPrPublishMode(mode: PublishMode): boolean {
  return mode === "pull-request" || mode === "draft-pull-request";
}

export function publishModeSummary(): string {
  return PUBLISH_MODES.join(", ");
}
