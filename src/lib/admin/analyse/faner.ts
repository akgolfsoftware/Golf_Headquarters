/**
 * Analyse (Innsikt) — fanedefinisjonen (MASTERPLAN 15.8, beslutning 6.9 «én
 * inngang per funksjon»).
 *
 * TRE adresser ble til én: /admin/analyse.
 *   /admin/analyse             → fane "stall"        (InnsiktHubV2 — uendret standardvisning)
 *   /admin/analyse/stall       → fane "stall" + `?visning=trend` (InnsiktStallV2 — trend/4-ukers
 *                                 detalj, nestet under samme fane fordi begge er stall-nivå,
 *                                 se AVVIK under)
 *   /admin/analysere/compliance → fane "etterlevelse" (AdminComplianceV2, norsk navn på
 *                                 «compliance» — matcher canvasens pille-tekst)
 *
 * AVVIK FRA CANVASEN (Analyse.dc.html, tegnet 30.08.2026): canvasen viser FIRE piller —
 * Spiller · Stall (14) · Etterlevelse · Tester — med «Spiller» valgt som default. Denne
 * PR-en bygger kun de TRE fanene MASTERPLAN-radens kildeliste faktisk dekker:
 *   - «Tester» er IKKE tatt med. `/admin/tester` er en egen, allerede fungerende stall-nivå
 *     flate (delt `InnsiktHubNav`-subnav med Runder/TrackMan/Rapporter/Etterlevelse) og står
 *     ikke i MASTERPLAN 15.8s kildeliste. Å trekke den inn her ville vært scope creep utover
 *     det Anders har bedt om å slå sammen nå — se PR-beskrivelsen for full begrunnelse.
 *   - Standardfanen er «stall», IKKE «spiller» slik canvasen tegner. `src/components/v2/
 *     shell.tsx` har en ekte, sitewide navigasjonsdestinasjon `{ id: "innsikt", href:
 *     "/admin/analyse" }` (label «Innsikt»), og flere andre steder (AdminReportsV2,
 *     KonsollArtefakt, V2Feil-tilbakeknappen på compliance-feilsiden) lenker bart til
 *     `/admin/analyse` i forventning om stall-oversikten som i dag vises der. Å bytte
 *     standardvisning til en spillerliste ville endret betydningen av disse lenkene uten at
 *     de er rørt i denne PR-en. «Spiller» finnes som egen fane — den er bare ikke default.
 *
 * «Spiller»-fanen dupliserer ALDRI `sammenlignMedSegSelv()`/`AdminSpillerAnalyseV2`
 * (den ferdigbygde per-spiller-innsikten på `/admin/spillere/[id]/analyse`) — den er en
 * ren spillerliste som drilner videre dit, samme mønster som Turneringes «Dubletter» og
 * Køs kilde-piller peker videre til delte komponenter.
 *
 * Ren modul: ingen Prisma, ingen React. Alle tre kildesider hadde IDENTISK gate
 * (`requirePortalUser({ allow: ["ADMIN", "COACH"] })`) — sammenslåingen utvider derfor
 * ikke tilgang for noen av fanene.
 */

export type AnalyseFaneId = "spiller" | "stall" | "etterlevelse";

export type AnalyseFane = {
  id: AnalyseFaneId;
  label: string;
  /** Adressen fanen erstattet — kilden til redirecten. null = fanen fantes ikke som egen adresse. */
  gammelHref: string | null;
};

/** Rekkefølgen er canvas-rekkefølgen (Spiller · Stall · Etterlevelse), minus Tester — se filhodet. */
export const ANALYSE_FANER: AnalyseFane[] = [
  { id: "spiller", label: "Spiller", gammelHref: null },
  { id: "stall", label: "Stall", gammelHref: "/admin/analyse" },
  { id: "etterlevelse", label: "Etterlevelse", gammelHref: "/admin/analysere/compliance" },
];

/** Se AVVIK i filhodet: «stall» (ikke «spiller») for å bevare eksisterende, sitewide lenker. */
export const ANALYSE_STANDARDFANE: AnalyseFaneId = "stall";

/** Er `s` en kjent fane-id? Brukes på `?fane=`-parameteren. */
export function erAnalyseFaneId(s: string | undefined): s is AnalyseFaneId {
  return s !== undefined && ANALYSE_FANER.some((f) => f.id === s);
}

/** Ukjent, manglende eller ukjent `?fane=` faller tilbake til standardfanen. */
export function velgAnalyseFane(onsket: string | undefined): AnalyseFaneId {
  return erAnalyseFaneId(onsket) ? onsket : ANALYSE_STANDARDFANE;
}

/** `/admin/analyse?fane=<id>` — standardfanen får ren adresse uten parameter. */
export function analyseHref(fane: AnalyseFaneId): string {
  return fane === ANALYSE_STANDARDFANE ? "/admin/analyse" : `/admin/analyse?fane=${fane}`;
}

/**
 * `/admin/analyse/stall` (InnsiktStallV2 — trend/4-ukers detalj) erstattes ikke av en egen
 * fane, men av en nestet `?visning=trend` under «stall»-fanen — begge var stall-nivå og
 * samme motor (Broadie-SG), og InnsiktHubV2s egen «Åpne stall-innsikt»-CTA pekte allerede
 * hit før sammenslåingen.
 */
export const ANALYSE_STALL_TREND_HREF = "/admin/analyse?fane=stall&visning=trend";
