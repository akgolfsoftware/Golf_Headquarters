/**
 * Oppsett — fanedefinisjonen (MASTERPLAN 15.3, beslutning 6.9).
 *
 * Åtte adresser ble til én: /admin/oppsett.
 *   - /admin/settings (Akademi, standardfane)
 *   - /admin/klubb/innstillinger (Klubb)
 *   - /admin/settings/calendar (Kalender)
 *   - /admin/settings/tilgang (Tilgang)
 *   - /admin/settings/security (Sikkerhet)
 *   - /admin/integrasjoner (Integrasjoner)
 *   - /admin/settings/api (API)
 *   - /admin/settings/periode-navn (Perioder)
 *
 * Rekkefølgen følger canvasen Anders godkjente 30.08:
 * designsystem/canvas/agencyos-ia/Oppsett.dc.html
 *
 * Ren modul: ingen Prisma, ingen React — tilgangsregelen kan testes uten base.
 */

export type OppsettFaneId =
  | "akademi"
  | "klubb"
  | "kalender"
  | "tilgang"
  | "sikkerhet"
  | "integrasjoner"
  | "api"
  | "perioder";

export type OppsettFane = {
  id: OppsettFaneId;
  label: string;
  /** Adressen fanen erstattet — kilden til redirecten. */
  gammelHref: string;
  /**
   * Fanen krever ADMIN, ikke bare ADMIN/COACH — arvet 1:1 fra kildesidens
   * egen `requirePortalUser({ allow: [...] })`. En sammenslåing skal aldri
   * utvide tilgang.
   */
  kreverAdmin: boolean;
};

/** Rekkefølgen er visningsrekkefølgen, og følger canvasen Anders godkjente 30.08. */
export const OPPSETT_FANER: OppsettFane[] = [
  { id: "akademi", label: "Akademi", gammelHref: "/admin/settings", kreverAdmin: true },
  { id: "klubb", label: "Klubb", gammelHref: "/admin/klubb/innstillinger", kreverAdmin: true },
  { id: "kalender", label: "Kalender", gammelHref: "/admin/settings/calendar", kreverAdmin: false },
  { id: "tilgang", label: "Tilgang", gammelHref: "/admin/settings/tilgang", kreverAdmin: true },
  { id: "sikkerhet", label: "Sikkerhet", gammelHref: "/admin/settings/security", kreverAdmin: false },
  { id: "integrasjoner", label: "Integrasjoner", gammelHref: "/admin/integrasjoner", kreverAdmin: true },
  { id: "api", label: "API", gammelHref: "/admin/settings/api", kreverAdmin: true },
  { id: "perioder", label: "Perioder", gammelHref: "/admin/settings/periode-navn", kreverAdmin: false },
];

export const OPPSETT_STANDARDFANE: OppsettFaneId = "akademi";

export function erOppsettFaneId(s: string | undefined): s is OppsettFaneId {
  return s !== undefined && OPPSETT_FANER.some((f) => f.id === s);
}

/** Fanene brukeren faktisk får se. En COACH ser kun Kalender, Sikkerhet og Perioder. */
export function synligeOppsettFaner(erAdmin: boolean): OppsettFane[] {
  return OPPSETT_FANER.filter((f) => !f.kreverAdmin || erAdmin);
}

/**
 * Hvilken fane skal vises? Ukjent, manglende eller utilgjengelig `?fane=`
 * faller til første SYNLIGE fane — aldri til en fane brukeren ikke får se.
 */
export function velgOppsettFane(
  onsket: string | undefined,
  synlige: OppsettFane[],
): OppsettFaneId {
  if (erOppsettFaneId(onsket) && synlige.some((f) => f.id === onsket)) return onsket;
  const standard = synlige.find((f) => f.id === OPPSETT_STANDARDFANE);
  return (standard ?? synlige[0]).id;
}

/** `/admin/oppsett?fane=<id>` — standardfanen får ren adresse. */
export function oppsettHref(fane: OppsettFaneId): string {
  return fane === OPPSETT_STANDARDFANE ? "/admin/oppsett" : `/admin/oppsett?fane=${fane}`;
}
