// Artefakt-typer for /meg — de ti flatene fra Jarvis-skjermplanen (saker,
// sak, vakt, dagen, brief, journal, review, maskinrom, historikk,
// innstillinger) pluss fangst, alle vist i ÉTT panel styrt av state
// (nattsesjon-prompt Fase 2 punkt 1) — ikke egne ruter.
export const ARTEFAKT_TYPER = [
  "saker",
  "sak",
  "vakt",
  "dagen",
  "brief",
  "journal",
  "review",
  "maskinrom",
  "historikk",
  "innstillinger",
  "fangst",
] as const;

export type ArtefaktType = (typeof ARTEFAKT_TYPER)[number];

export function erArtefaktType(verdi: string | null | undefined): verdi is ArtefaktType {
  return verdi != null && (ARTEFAKT_TYPER as readonly string[]).includes(verdi);
}

export const ARTEFAKT_TITTEL: Record<ArtefaktType, string> = {
  saker: "Saker",
  sak: "Sak",
  vakt: "Kalendervakt",
  dagen: "Dagen",
  brief: "Morgenbrief",
  journal: "Kveldsjournal",
  review: "Ukesreview",
  maskinrom: "Maskinrommet",
  historikk: "Historikk",
  innstillinger: "Innstillinger",
  fangst: "Fangst",
};
