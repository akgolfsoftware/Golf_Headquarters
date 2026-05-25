/**
 * S-21: safeUrl() — filtrer bort javascript:, data:, vbscript: og andre
 * farlige protokoller fra URLer som kommer fra databasen og brukes i
 * href-attributter.
 *
 * Bruk:
 *   import { safeUrl } from "@/lib/security/safe-url";
 *   <a href={safeUrl(drill.videoUrl)}>Se video</a>
 *
 * Returnerer null hvis URL-en er tom, null, eller bruker farlig protokoll.
 * Komponenten bør rendres betinget: `{safeUrl(url) && <a href={safeUrl(url)!}>…</a>}`
 */

/** Protokoller som er eksplisitt tillatt */
const ALLOWED_PROTOCOLS = new Set(["https:", "http:"]);

/**
 * Saniterer en URL fra DB/bruker-input.
 * Returnerer den rensede URL-strengen, eller `null` om den er farlig.
 */
export function safeUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (trimmed.length === 0) return null;

  try {
    const parsed = new URL(trimmed);
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return null;
    }
    return trimmed;
  } catch {
    // Ikke en gyldig absolutt URL — kan være relativ path (/portal/...)
    // Relativ path er OK (ingen protokoll-risiko), men vi avviser alt
    // som starter med "javascript", "data", "vbscript" case-insensitively.
    const lower = trimmed.toLowerCase().replace(/\s/g, "");
    if (
      lower.startsWith("javascript:") ||
      lower.startsWith("data:") ||
      lower.startsWith("vbscript:") ||
      lower.startsWith("mhtml:") ||
      lower.startsWith("file:")
    ) {
      return null;
    }
    // Relativ path — tillatt
    return trimmed.startsWith("/") ? trimmed : null;
  }
}
