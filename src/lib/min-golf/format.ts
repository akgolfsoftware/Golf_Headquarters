// Formattering for golfdata-flatene — domenefasit fra design-handover v13:
// SG med fortegn + én desimal + enheten «slag», norsk komma-desimal,
// putting i fot, meter med V/H. Ren formatering — aldri beregning.

const nb = new Intl.NumberFormat("nb-NO", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** SG-verdi som visningsstreng med fortegn og komma-desimal: +1,2 / −0,8 / 0,0. */
export function fmtSg(verdi: number): string {
  const abs = nb.format(Math.abs(verdi));
  if (verdi > 0) return `+${abs}`;
  if (verdi < 0) return `−${abs}`; // ekte minustegn, ikke bindestrek
  return abs;
}

/** Heltall med norsk tusenskille. */
export function fmtHeltall(verdi: number): string {
  return new Intl.NumberFormat("nb-NO", { maximumFractionDigits: 0 }).format(verdi);
}

/** Meter → fot (putting vises ALLTID i fot — kanon 3. jul 2026). */
export function meterTilFot(meter: number): number {
  return meter * 3.28084;
}

/** Kort norsk dato-etikett for trendpunkter: «12. mai». */
export function fmtKortDato(dato: Date): string {
  return new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "short" }).format(dato);
}

/** SG-aksenes klarspråk (kanon): OTT Tee-slag · APP Innspill · ARG Nærspill · PUTT Putting. */
export const SG_KLARSPRAK: Record<"OTT" | "APP" | "ARG" | "PUTT", string> = {
  OTT: "Tee-slag",
  APP: "Innspill",
  ARG: "Nærspill",
  PUTT: "Putting",
};

/**
 * Navnet på SG-baselinen slik den faktisk beregnes i appen (sg-hub):
 * PGA Tour-referanse (Broadie) for OTT/APP/ARG, Team Norway IUP for PUTT.
 * Samleflater bruker den generelle betegnelsen.
 */
export const SG_BASELINE_NAVN = "PGA Tour-snitt (Broadie)";
export const PUTT_BASELINE_NAVN = "Team Norway IUP";
