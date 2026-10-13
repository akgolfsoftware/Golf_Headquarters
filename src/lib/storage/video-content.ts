import "server-only";
import { videoHeaderMatches } from "./video-header";
/** Leser maksimalt 64KiB fra en URL signert av vår egen lagringstjeneste. */
export async function storedVideoHeaderMatches(signedUrl: string, mimeType: string, fileSize: number): Promise<boolean> {
  const response = await fetch(signedUrl, { headers: { Range: "bytes=0-65535" }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000) });
  if (!response.ok || !response.body) return false;
  const reader = response.body.getReader(); const parts: Uint8Array[] = []; let length = 0;
  try {
    while (length < 65536) {
      const part = await reader.read(); if (part.done) break;
      const bytes = part.value.subarray(0, 65536 - length); parts.push(bytes); length += bytes.length;
    }
  } finally { await reader.cancel().catch(() => {}); }
  const header = new Uint8Array(length); let offset = 0;
  for (const part of parts) { header.set(part, offset); offset += part.length; }
  return videoHeaderMatches(header, mimeType, fileSize);
}
