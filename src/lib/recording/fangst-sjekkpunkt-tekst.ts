/**
 * Ren: sjekkpunkt-tekst fra fangst-analyse (uten DB).
 */

import type { AnalyseResultat } from "@/lib/coaching-analysis";

/** Bygg sjekkpunkt-tekst fra analyse (kort, coach-vennlig). */
export function byggSjekkpunktFraAnalyse(analyse: AnalyseResultat): string {
  const deler = [
    analyse.nesteOktAnbefaling?.trim(),
    analyse.hjemmelekse?.trim()
      ? `Hjemmelekse: ${analyse.hjemmelekse.trim()}`
      : null,
    analyse.oppsummering?.trim()
      ? `Oppsummert: ${analyse.oppsummering.trim()}`
      : null,
  ].filter((x): x is string => !!x && x.length > 0);
  const tekst = deler.join(" · ").slice(0, 1800);
  return tekst || "Fangst analysert — fyll inn sjekkpunkt manuelt.";
}
