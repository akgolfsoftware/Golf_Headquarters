// src/lib/meg/shortcut-auth.ts
// Bearer-token-verifisering for /api/meg/shortcut («Spør Jarvis» fra iOS
// Snarveier). Samme mønster som secretsMatch/webhookSecretOk i meg/telegram.ts.
import "server-only";
import { timingSafeEqual } from "node:crypto";

/** Tidskonstant streng-sammenligning — unngår timing attacks ved token-verifisering. */
function tokensMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Trekker Bearer-tokenet ut av en Authorization-header. Null ved feil/manglende format. */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const match = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  if (!match) return null;
  const token = match[1].trim();
  return token.length > 0 ? token : null;
}

/** Sant kun hvis Authorization-headeren bærer nøyaktig det forventede Bearer-tokenet. */
export function shortcutTokenOk(authHeader: string | null, expectedToken: string): boolean {
  const token = extractBearerToken(authHeader);
  if (!token) return false;
  return tokensMatch(token, expectedToken);
}
