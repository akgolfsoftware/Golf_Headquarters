/**
 * Stall-status («Trenger deg» · «Følger planen» · «Hviler») — kalibrert 20.10.2026 (audit B1).
 *
 * Rødt skal bety noe, så «Trenger deg» bygger bare på ekte signaler:
 *   1. Etterlevelse siste fire uker under 50 % (gjennomførte mot planlagte minutter).
 *   2. Spillerforespørsel ubesvart i over 24 timer.
 *   3. Risiko: kontoen er eksplisitt satt til INAKTIV.
 * Stille innlogging alene er ikke et signal (en spiller som følger planen trenger ikke coach),
 * og er den lav i etterlevelse fanger signal 1 det.
 * Mangler et signal (ingen forfalte økter), teller det ikke som rødt.
 * Avtalt pause (SKADET/PERMISJON) går alltid foran og er «Hviler».
 *
 * Ren modul (ingen Prisma/React) så regelen kan låses med tester.
 */

export type StallStatusKind = "aktiv" | "bak" | "inaktiv" | "veil" | "hviler";

export const ETTERLEVELSE_TERSKEL_PCT = 50;
export const UBESVART_TIMER = 24;

export type StallStatusInput = {
  userStatus: string;
  /** Fire ukers etterlevelse i prosent. Null = ingen forfalte økter (mangler data). */
  etterlevelsePct: number | null;
  /** Alder i timer på eldste ubesvarte spillerforespørsel. Null = ingen åpne. */
  eldsteUbesvartTimer: number | null;
};

export function stallStatus(i: StallStatusInput): { status: StallStatusKind; label: string } {
  // Hviler FØR alt annet: en avtalt pause skal ikke leses som stillhet eller etterslep.
  if (i.userStatus === "SKADET") return { status: "hviler", label: "Retur til spill" };
  if (i.userStatus === "PERMISJON") return { status: "hviler", label: "Planlagt pause" };
  if (i.eldsteUbesvartTimer !== null && i.eldsteUbesvartTimer >= UBESVART_TIMER)
    return { status: "veil", label: "Ubesvart over 24 t" };
  if (i.userStatus === "INAKTIV") return { status: "inaktiv", label: "Inaktiv" };
  if (i.etterlevelsePct !== null && i.etterlevelsePct < ETTERLEVELSE_TERSKEL_PCT)
    return { status: "bak", label: "Bak plan" };
  if (i.etterlevelsePct === null) return { status: "aktiv", label: "Ingen plandata" };
  return { status: "aktiv", label: "Aktiv" };
}
