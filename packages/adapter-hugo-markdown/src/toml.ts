export function tomlString(value: string): string {
  return `"${value
    .replace(/\\/gu, "\\\\")
    .replace(/"/gu, '\\"')
    .replace(/\n/gu, "\\n")
    .replace(/\r/gu, "\\r")
    .replace(/\t/gu, "\\t")}"`;
}

export function formatTomlArray(key: string, values: string[]): string {
  if (values.length === 0) {
    return `${key} = []`;
  }

  const items = values.map((value) => tomlString(value)).join(", ");
  return `${key} = [${items}]`;
}
