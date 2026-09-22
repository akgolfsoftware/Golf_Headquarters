/**
 * Ordene brukeren ser for `UserStatus`.
 *
 * Enum-verdien er databasens ord, ikke appens. PERMISJON heter «Idrettsfravær»
 * på skjermen (Anders 22.09.2026) — vises enum-verdien rå, står det PERMISJON
 * i appen og Idrettsfravær i tegningen, og det er to ord for samme tilstand.
 *
 * AgencyOS har sin egen formulering i `src/lib/admin/stallen-data.ts`
 * («Planlagt pause», «Retur til spill»), der statusen grupperes i hviler/inaktiv.
 * Den er ikke lagt om her.
 */

const ORD: Record<string, string> = {
  AKTIV: "Aktiv",
  PERMISJON: "Idrettsfravær",
  SKADET: "Skadet",
  INAKTIV: "Inaktiv",
};

export function brukerStatusOrd(status: string): string {
  return ORD[status] ?? status;
}

/** Pilletone for status. Rød er identitet og frist i Team Norway, aldri status. */
export function brukerStatusTone(status: string): "green" | "amber" | "nøytral" {
  if (status === "AKTIV") return "green";
  if (status === "SKADET") return "amber";
  return "nøytral";
}
