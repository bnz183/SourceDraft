export const SOURCEDRAFT_VERSION = "0.0.1";

export function parseVersion(value: string): [number, number, number] | null {
  const match = /^(\d+)\.(\d+)\.(\d+)/u.exec(value.trim());
  if (!match) {
    return null;
  }

  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function satisfiesSourceDraftVersion(
  required: string,
  actual: string,
): boolean {
  const requiredParts = parseVersion(required);
  const actualParts = parseVersion(actual);

  if (requiredParts === null || actualParts === null) {
    return false;
  }

  for (let index = 0; index < 3; index += 1) {
    const requiredPart = requiredParts[index] ?? 0;
    const actualPart = actualParts[index] ?? 0;
    if (actualPart < requiredPart) {
      return false;
    }
    if (actualPart > requiredPart) {
      return true;
    }
  }

  return true;
}
