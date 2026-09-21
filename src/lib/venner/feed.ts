/**
 * Vennefeed — hva en venn faktisk får se.
 *
 * Ren modul uten Prisma, så regelen kan testes for seg: en venn ser at en
 * økt skjedde, og når. Ikke hva spilleren trente på, ikke hvor, ikke hvorfor.
 *
 * Praksistype og miljø er AK-taksonomi (`lib/portal/translate-taxonomy.ts`).
 * Oversatt til norsk ser de ufarlige ut — «Variasjon · Bane-simulering» —
 * men de beskriver coachens treningsopplegg, og de hører ikke hjemme i en
 * sosial feed. Feeden viste dem fram til 21.09.2026, stikk i strid med sin
 * egen dokumenterte regel.
 */

export type VennFeedElement = {
  id: string;
  slag: "runde" | "okt";
  tittel: string;
  detalj: string;
  /** ISO-streng. */
  dato: string;
};

/** Én fullført treningsøkt, uten fagdata. */
export function byggOktFeedElement(okt: {
  id: string;
  startTime: Date;
}): VennFeedElement {
  return {
    id: `okt-${okt.id}`,
    slag: "okt",
    tittel: "Trente en økt",
    detalj: "",
    dato: okt.startTime.toISOString(),
  };
}

/**
 * Én spilt runde. Banenavnet blir stående: det er hvor noen spilte golf, ikke
 * en opplysning om treningsopplegget, og det er poenget med en sosial feed.
 */
export function byggRundeFeedElement(runde: {
  id: string;
  playedAt: Date;
  roundType: string | null;
  baneNavn: string;
}): VennFeedElement {
  return {
    id: `runde-${runde.id}`,
    slag: "runde",
    tittel: runde.roundType === "turnering" ? "Spilte en turneringsrunde" : "Spilte en runde",
    detalj: runde.baneNavn,
    dato: runde.playedAt.toISOString(),
  };
}
