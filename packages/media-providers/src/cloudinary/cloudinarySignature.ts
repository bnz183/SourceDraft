import { createHash } from "node:crypto";

export function buildCloudinarySignature(
  params: Record<string, string | number>,
  apiSecret: string,
): string {
  const serialized = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}
