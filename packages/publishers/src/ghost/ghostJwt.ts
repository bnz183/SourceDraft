import { SignJWT } from "jose";

export function parseGhostAdminApiKey(
  apiKey: string,
): { id: string; secret: Buffer } | { ok: false; error: string } {
  const trimmed = apiKey.trim();
  const separator = trimmed.indexOf(":");

  if (separator <= 0 || separator === trimmed.length - 1) {
    return {
      ok: false,
      error:
        "GHOST_ADMIN_API_KEY must be in id:secret format from Ghost Admin → Integrations.",
    };
  }

  const id = trimmed.slice(0, separator);
  const secretHex = trimmed.slice(separator + 1);

  try {
    const secret = Buffer.from(secretHex, "hex");
    if (secret.length === 0) {
      return { ok: false, error: "Ghost Admin API key secret is not valid hex." };
    }

    return { id, secret };
  } catch {
    return { ok: false, error: "Ghost Admin API key secret is not valid hex." };
  }
}

export async function createGhostAdminJwt(
  apiKey: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<{ token: string } | { ok: false; error: string }> {
  const parsed = parseGhostAdminApiKey(apiKey);
  if ("ok" in parsed) {
    return parsed;
  }

  const token = await new SignJWT({ aud: "/admin/" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT", kid: parsed.id })
    .setIssuedAt(nowSeconds)
    .setExpirationTime(nowSeconds + 5 * 60)
    .sign(parsed.secret);

  return { token };
}
