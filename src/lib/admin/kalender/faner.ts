/**
 * Kalender — fanedefinisjonen (MASTERPLAN 15.4, beslutning 6.9 «én inngang
 * per funksjon»).
 *
 * Fem adresser ble til én: /admin/kalender.
 *   /admin/kalender               → fane "uke" (standardfane, samme flate som før)
 *   /admin/kalender?visning=maned → fane "maned" (var intern visning, nå fane)
 *   /admin/kalender?visning=dag   → fane "dag" (var intern visning, nå fane)
 *   /admin/stall/dag              → fane "stall" (spillere som kolonner)
 *   /admin/kalender/lag           → redirectet allerede hit (T7) — lag-FILTERET
 *                                   er chips i verktøylinjen, ikke en fane
 *   /admin/agencyos/uka           → redirectet allerede hit (T7)
 *
 * Bevisste avvik fra canvasen (designsystem/canvas/agencyos-ia/Kalender.dc.html):
 *   – «Lag» er IKKE en fane: lag-filteret er allerede løst som chips i
 *     verktøylinjen, og /admin/kalender/lag redirecter hit — en Lag-fane
 *     ville gitt to steder for samme filter (samme regel som holdt
 *     agentko utenfor Jarvis i 15.5).
 *   – «Ledighet» er IKKE en fane: tilgjengelighet er en egen skriveflyt
 *     (/admin/availability) og beholder lenken «Tilgjengelighet» i
 *     verktøylinjen — å flette en sjette adresse inn var utenfor 15.4-raden.
 *   – «Stall-dag» er fane selv om canvasen ikke tegner den: adressen står i
 *     radens «slås sammen fra»-liste, og innholdet (spillere som kolonner)
 *     kan ikke flettes inn i kalenderens dag-visning uten motorarbeidet i
 *     MASTERPLAN 14.6, som IKKE er vedtatt. Ingen funksjonalitet fjernes.
 *
 * `/admin/kalender/hendelse/ny` («Ny hendelse») er IKKE en fane — den er
 * CTA-en i toppen som peker til den uendrede opprettelsessiden (samme
 * bevisste unntak som Turnerings /admin/tournaments/ny i 15.6).
 *
 * Ren modul: ingen Prisma, ingen React. Alle faner har samme gate som
 * kildesidene hadde (ADMIN/COACH, ingen capability) — en sammenslåing
 * skal ALDRI utvide tilgang.
 */

export type KalenderFaneId = "uke" | "maned" | "dag" | "stall";

export type KalenderFane = {
  id: KalenderFaneId;
  label: string;
  /** Adressen fanen erstattet — kilden til redirecten. null = var intern visning på samme adresse. */
  gammelHref: string | null;
};

export const KALENDER_FANER: KalenderFane[] = [
  { id: "uke", label: "Uke", gammelHref: null },
  { id: "maned", label: "Måned", gammelHref: null },
  { id: "dag", label: "Dag", gammelHref: null },
  { id: "stall", label: "Stall-dag", gammelHref: "/admin/stall/dag" },
];

export const KALENDER_STANDARDFANE: KalenderFaneId = "uke";

/** Er `s` en kjent fane-id? Brukes på `?fane=`-parameteren. */
export function erKalenderFaneId(s: string | undefined): s is KalenderFaneId {
  return s !== undefined && KALENDER_FANER.some((f) => f.id === s);
}

/**
 * Hvilken fane skal vises? `?fane=` vinner; gamle dyplenker med
 * `?visning=maned|dag` (fra før 15.4, og fra periode-navigasjonens hrefs i
 * `lag/data.ts`) mapper til samme fane så ingen eksisterende lenke brekker.
 * Ukjent/manglende → standardfanen.
 */
export function velgKalenderFane(fane: string | undefined, visning: string | undefined): KalenderFaneId {
  if (erKalenderFaneId(fane)) return fane;
  if (visning === "maned" || visning === "dag") return visning;
  return KALENDER_STANDARDFANE;
}

/** `/admin/kalender?fane=<id>` — standardfanen får ren adresse uten parameter. */
export function kalenderHref(fane: KalenderFaneId): string {
  return fane === KALENDER_STANDARDFANE ? "/admin/kalender" : `/admin/kalender?fane=${fane}`;
}
