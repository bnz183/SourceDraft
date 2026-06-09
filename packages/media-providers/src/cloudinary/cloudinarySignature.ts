import { createHash } from "node:crypto";

export function serializeCloudinarySignatureParams(
  params: Record<string, string | number>,
): string {
  return Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
}

export function buildCloudinarySignature(
  params: Record<string, string | number>,
  apiSecret: string,
): string {
  const serialized = serializeCloudinarySignatureParams(params);
  return createHash("sha256").update(`${serialized}${apiSecret}`).digest("hex");
}
