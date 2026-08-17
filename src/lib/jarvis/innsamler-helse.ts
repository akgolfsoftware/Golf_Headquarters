// Ren avledningslogikk for Maskinrommet: siste AgentRun-status + alder →
// InnsamlerHelse. Utskilt fra repository.ts (som gjør selve Prisma-kallet)
// slik at avledningen er enhetstestbar uten database.
import type { InnsamlerHelse } from "@/lib/jarvis/types";

/** Hvor mange ganger det forventede intervallet en OK-kjøring får eldes før den regnes som stille/feilet. */
const STALE_FAKTOR = 3;

/** Ingen kjøreplan (manuelt kjørt script) — grace-vindu før en gammel OK-kjøring regnes som stille. */
const MANUELL_GRACE_MS = 48 * 60 * 60 * 1000;

export function avledInnsamlerHelse(
  sisteKjoring: { status: string; createdAt: Date } | null,
  na: Date,
  /** Forventet kjøreintervall i ms (f.eks. 600_000 for hvert 10. min) — null hvis ingen LaunchAgent/cron finnes. */
  forventetIntervallMs: number | null,
): InnsamlerHelse {
  if (!sisteKjoring) return "UKJENT";
  if (sisteKjoring.status === "ERROR") return "FEILET";
  const alderMs = na.getTime() - sisteKjoring.createdAt.getTime();
  const graenseMs = forventetIntervallMs != null ? forventetIntervallMs * STALE_FAKTOR : MANUELL_GRACE_MS;
  if (alderMs > graenseMs) return "FEILET";
  return "OK";
}
