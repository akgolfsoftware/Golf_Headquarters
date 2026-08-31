/**
 * Turnering — fanedefinisjonen (MASTERPLAN 15.6, beslutning 6.9 «én inngang
 * per funksjon»).
 *
 * Fire adresser ble til én: /admin/turnering.
 *   /admin/tournaments            → fane "alle" (standardfane, ny full liste)
 *   /admin/tournaments (filter)   → fane "mine-spillere" (samme datakilde som
 *                                    /admin/tournaments hadde, nå som filter)
 *   /admin/tournaments/dubletter  → fane "dubletter"
 *   /admin/turnering-kart         → fane "kart"
 *
 * `/admin/tournaments/ny` («Ny turnering») er IKKE en fane — den er en CTA i
 * toppen av siden som peker videre til den uendrede opprettelsessiden.
 *
 * Dubletter-VERKTØYET bor her (§MASTERPLAN 15.6-raden). Kø (15.1) viser
 * fortsatt dubletter som sak-type på sin egen adresse — begge steder virker,
 * de deler samme loader (`src/lib/admin/ko/last-dubletter.ts`).
 *
 * Ren modul: ingen Prisma, ingen React. Alle fire faner har samme gate som
 * kildesidene hadde (ADMIN/COACH, ingen ekstra capability) — en sammenslåing
 * skal ALDRI utvide tilgang.
 */

export type TurneringFaneId = "alle" | "mine-spillere" | "dubletter" | "kart";

export type TurneringFane = {
  id: TurneringFaneId;
  label: string;
  /** Adressen fanen erstattet — kilden til redirecten. null = ny fane uten egen tidligere adresse. */
  gammelHref: string | null;
};

/** Rekkefølgen er visningsrekkefølgen, godkjent i designsystem/canvas/agencyos-ia/Turnering.dc.html (30.08.2026). */
export const TURNERING_FANER: TurneringFane[] = [
  { id: "alle", label: "Alle", gammelHref: "/admin/tournaments" },
  { id: "mine-spillere", label: "Mine spillere", gammelHref: null },
  { id: "dubletter", label: "Dubletter", gammelHref: "/admin/tournaments/dubletter" },
  { id: "kart", label: "Kart", gammelHref: "/admin/turnering-kart" },
];

export const TURNERING_STANDARDFANE: TurneringFaneId = "alle";

/** Er `s` en kjent fane-id? Brukes på `?fane=`-parameteren. */
export function erTurneringFaneId(s: string | undefined): s is TurneringFaneId {
  return s !== undefined && TURNERING_FANER.some((f) => f.id === s);
}

/**
 * Hvilken fane skal vises? Ukjent, manglende eller ukjent `?fane=` faller
 * tilbake til standardfanen — alle fire faner er synlige for alle med
 * sidens basisgate, så det finnes ingen «utilgjengelig, men gyldig» fane her.
 */
export function velgTurneringFane(onsket: string | undefined): TurneringFaneId {
  return erTurneringFaneId(onsket) ? onsket : TURNERING_STANDARDFANE;
}

/** `/admin/turnering?fane=<id>` — standardfanen får ren adresse uten parameter. */
export function turneringHref(fane: TurneringFaneId): string {
  return fane === TURNERING_STANDARDFANE ? "/admin/turnering" : `/admin/turnering?fane=${fane}`;
}
