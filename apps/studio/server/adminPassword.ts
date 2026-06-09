import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const DEFAULT_SCRYPT_N = 16384;
const DEFAULT_SCRYPT_R = 8;
const DEFAULT_SCRYPT_P = 1;
const DEFAULT_SCRYPT_KEYLEN = 64;

export type ScryptHashParams = {
  N: number;
  r: number;
  p: number;
  salt: Buffer;
  hash: Buffer;
};

export function parseScryptPasswordHash(
  value: string,
): ScryptHashParams | null {
  const parts = value.trim().split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") {
    return null;
  }

  const N = Number(parts[1]);
  const r = Number(parts[2]);
  const p = Number(parts[3]);
  if (!Number.isInteger(N) || !Number.isInteger(r) || !Number.isInteger(p)) {
    return null;
  }

  try {
    const salt = Buffer.from(parts[4] ?? "", "base64");
    const hash = Buffer.from(parts[5] ?? "", "base64");
    if (salt.length === 0 || hash.length === 0) {
      return null;
    }

    return { N, r, p, salt, hash };
  } catch {
    return null;
  }
}

export function formatScryptPasswordHash(
  params: ScryptHashParams,
): string {
  return [
    "scrypt",
    params.N,
    params.r,
    params.p,
    params.salt.toString("base64"),
    params.hash.toString("base64"),
  ].join("$");
}

export function hashAdminPassword(
  password: string,
  options?: { N?: number; r?: number; p?: number; keylen?: number },
): string {
  const N = options?.N ?? DEFAULT_SCRYPT_N;
  const r = options?.r ?? DEFAULT_SCRYPT_R;
  const p = options?.p ?? DEFAULT_SCRYPT_P;
  const keylen = options?.keylen ?? DEFAULT_SCRYPT_KEYLEN;
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, keylen, { N, r, p });

  return formatScryptPasswordHash({ N, r, p, salt, hash });
}

export function verifyScryptPassword(
  password: string,
  storedHash: string,
): boolean {
  const parsed = parseScryptPasswordHash(storedHash);
  if (parsed === null) {
    return false;
  }

  const derived = scryptSync(password, parsed.salt, parsed.hash.length, {
    N: parsed.N,
    r: parsed.r,
    p: parsed.p,
  });

  if (derived.length !== parsed.hash.length) {
    return false;
  }

  return timingSafeEqual(derived, parsed.hash);
}

export function verifyPlaintextPassword(
  password: string,
  expected: string,
): boolean {
  const provided = Buffer.from(password);
  const target = Buffer.from(expected);

  if (provided.length !== target.length) {
    return false;
  }

  return timingSafeEqual(provided, target);
}
