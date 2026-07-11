// Ren beslutningslogikk (ingen prisma) for masseredigering av en mal-uke:
// kopier uke → uke og sett varighet for hele uka. Actions i
// admin/(legacy)/plan-templates/actions.ts er tynne DB-skall rundt denne.

export interface UkeOkt {
  id: string;
  ukeNr: number;
  dagNr: number;
  title: string;
  varighetMin: number;
  pyramidArea: string;
  skillArea: string | null;
  environment: string;
  drillsJson: unknown;
  focus: string | null;
  notes: string | null;
}

export type KopierUkeResultat =
  | { status: "tom-kilde" }
  | { status: "konflikt"; antallIMaal: number }
  | { status: "ok"; slettIds: string[]; nyeRader: Omit<UkeOkt, "id">[] };

/**
 * Planlegg kopiering av kilde-uke til mål-uke. Skriver ingenting selv —
 * returnerer hva som må slettes (kun ved overskriv) og hvilke rader som
 * skal opprettes (ukeNr satt til målukens nummer, ellers identisk kopi).
 */
export function planleggUkeKopi(
  kildeOkter: UkeOkt[],
  maalUkeNr: number,
  maalOkter: UkeOkt[],
  overskriv: boolean,
): KopierUkeResultat {
  if (kildeOkter.length === 0) return { status: "tom-kilde" };
  if (maalOkter.length > 0 && !overskriv) {
    return { status: "konflikt", antallIMaal: maalOkter.length };
  }

  const nyeRader: Omit<UkeOkt, "id">[] = kildeOkter.map((s) => ({
    ukeNr: maalUkeNr,
    dagNr: s.dagNr,
    title: s.title,
    varighetMin: s.varighetMin,
    pyramidArea: s.pyramidArea,
    skillArea: s.skillArea,
    environment: s.environment,
    drillsJson: s.drillsJson,
    focus: s.focus,
    notes: s.notes,
  }));

  return {
    status: "ok",
    slettIds: overskriv ? maalOkter.map((o) => o.id) : [],
    nyeRader,
  };
}

export type SettUkeVarighetResultat =
  | { status: "tom-uke" }
  | { status: "ok"; oktIder: string[] };

/** Planlegg å sette samme varighet på alle økter i en uke. Endrer ikke andre felt. */
export function planleggUkeVarighet(ukeOkter: UkeOkt[]): SettUkeVarighetResultat {
  if (ukeOkter.length === 0) return { status: "tom-uke" };
  return { status: "ok", oktIder: ukeOkter.map((o) => o.id) };
}
