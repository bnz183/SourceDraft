export function trimLeadingSlashes(value: string): string {
  let start = 0;
  while (start < value.length && value[start] === "/") {
    start += 1;
  }

  return value.slice(start);
}

export function trimTrailingSlashes(value: string): string {
  let end = value.length;
  while (end > 0 && value[end - 1] === "/") {
    end -= 1;
  }

  return value.slice(0, end);
}

export function trimSlashes(value: string): string {
  return trimTrailingSlashes(trimLeadingSlashes(value));
}

export function collapseSlashes(value: string): string {
  let result = "";
  let previousWasSlash = false;

  for (const char of value) {
    if (char === "/") {
      if (!previousWasSlash) {
        result += "/";
        previousWasSlash = true;
      }
      continue;
    }

    previousWasSlash = false;
    result += char;
  }

  return result;
}

export function fileExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf(".");
  if (dotIndex <= 0 || dotIndex === filename.length - 1) {
    return "";
  }

  return filename.slice(dotIndex + 1).toLowerCase();
}

export function hasFileExtension(filename: string, extensions: string[]): boolean {
  const extension = fileExtension(filename);
  if (extension.length === 0) {
    return false;
  }

  for (const candidate of extensions) {
    if (extension === candidate.toLowerCase()) {
      return true;
    }
  }

  return false;
}
