const SECRET_KEY_PATTERN =
  /(TOKEN|PASSWORD|SECRET|KEY|APP_PASSWORD|ADMIN_API_KEY|ACCESS_KEY)/i;

export function isSecretEnvKey(key: string): boolean {
  return SECRET_KEY_PATTERN.test(key);
}

export function maskSecretValue(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return "(empty)";
  }

  if (trimmed.length <= 4) {
    return "****";
  }

  return `${trimmed.slice(0, 2)}…${trimmed.slice(-2)} (${trimmed.length} chars)`;
}

export function formatEnvValueForDisplay(key: string, value: string): string {
  if (isSecretEnvKey(key)) {
    return maskSecretValue(value);
  }

  return value;
}
