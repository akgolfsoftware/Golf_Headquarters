/**
 * Stall — fanedefinisjonen (MASTERPLAN 15.11, beslutning 6.6 + 6.9).
 *
 * To adresser blir én: `/admin/spillere`. `/admin/queue` (oppfølging av
 * spillere) er IKKE Kø (beslutning 6.6) — den flytter inn hit som egen fane,
 * per canvas-notatet i `designsystem/canvas/agencyos-ia/Stall.dc.html`:
 * «Oppfølging av spillere (i dag /admin/queue) flytter inn hit som egen
 * fane — den er ikke Kø.»
 *
 * Begge faner hadde samme gate på kildesidene (ADMIN/COACH) — en
 * sammenslåing skal ALDRI utvide tilgang. Låst av faner.test.ts.
 *
 * Ren modul: ingen Prisma, ingen React.
 */

export type SpillereFaneId = "stall" | "oppfolging";

export type SpillereFane = {
  id: SpillereFaneId;
  label: string;
  /** Adressen fanen erstattet — kilden til redirecten. null = ingen (kildeadressen). */
  gammelHref: string | null;
};

export const SPILLERE_FANER: SpillereFane[] = [
  { id: "stall", label: "Stall", gammelHref: null },
  { id: "oppfolging", label: "Oppfølging", gammelHref: "/admin/queue" },
];

export const SPILLERE_STANDARDFANE: SpillereFaneId = "stall";

export function erSpillereFaneId(s: string | undefined): s is SpillereFaneId {
  return s !== undefined && SPILLERE_FANER.some((f) => f.id === s);
}

/** Ukjent, manglende eller ukjent `?fane=` faller til standardfanen. */
export function velgSpillereFane(onsket: string | undefined): SpillereFaneId {
  return erSpillereFaneId(onsket) ? onsket : SPILLERE_STANDARDFANE;
}

/** `/admin/spillere?fane=<id>` — standardfanen får ren adresse uten parameter. */
export function spillereHref(fane: SpillereFaneId): string {
  return fane === SPILLERE_STANDARDFANE ? "/admin/spillere" : `/admin/spillere?fane=${fane}`;
}
