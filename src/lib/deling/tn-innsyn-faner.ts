/** De åtte IUP-fanene, i samme rekkefølge og med samme navn som trenerflaten (TnSpillerFaner). */
export const TN_INNSYN_FANER = [
  { id: "oversikt", navn: "Oversikt" },
  { id: "turneringsplan", navn: "Turneringsplan" },
  { id: "ranking", navn: "Ranking" },
  { id: "turneringer", navn: "Turneringer" },
  { id: "trening", navn: "Trening" },
  { id: "tester", navn: "Tester" },
  { id: "teknisk-plan", navn: "Teknisk plan" },
  { id: "fireukerssjekk", navn: "Fireukerssjekk" },
] as const;

export type TnInnsynFane = (typeof TN_INNSYN_FANER)[number]["id"];

export function tilTnInnsynFane(verdi: unknown): TnInnsynFane {
  return TN_INNSYN_FANER.find((f) => f.id === verdi)?.id ?? "oversikt";
}
