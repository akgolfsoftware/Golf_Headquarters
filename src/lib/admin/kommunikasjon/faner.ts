/**
 * Kommunikasjon — fanedefinisjonen (MASTERPLAN 15.7, beslutning 6.9 «én
 * inngang per funksjon»).
 *
 * TRE adresser ble til én: /admin/kommunikasjon.
 *   /admin/innboks        → fane "innboks"  (saker: godkjenninger + meldinger)
 *   /admin/innboks-epost  → delt i to faner, samme datakilde (InnboksEpost),
 *                            filtrert på status:
 *                              "utkast" = NY | UTKAST_KLART (venter på deg)
 *                              "sendt"  = SENDT | ARKIVERT  (ferdigbehandlet)
 *   /admin/email-templates → fane "maler"
 *
 * AVVIK FRA MASTERPLAN-RADENS OPPRINNELIGE ORDLYD: raden listet også `/meg`
 * som en fjerde kilde. `/meg` er IKKE tatt med her — den er en egen,
 * frittstående Jarvis-chat-app (tråd/composer/artefaktpanel), ikke en enkel
 * e-post/innboks-flate, og STEG 14.7 flagger et uavklart spørsmål fra Anders
 * («skal meg/dispatch + meg/morgenbrief redirecte til /admin/brief?») som
 * IKKE er avgjort. Canvas-fasiten (Kommunikasjon.dc.html) viser kun de fire
 * fanene under, alle fra de tre innboks/mal-kildene — ingen av dem mapper
 * til /meg. `/meg`, `/meg/dispatch`, `/meg/morgenbrief` er URØRT av denne
 * PR-en. Se docs/MASTERPLAN-GJENSTAAENDE.md rad 15.7 for status.
 *
 * Ren modul: ingen Prisma, ingen React. Alle fire faner har samme gate som
 * kildesidene hadde (se enkeltsidene) — en sammenslåing skal ALDRI utvide
 * tilgang.
 */

export type KommunikasjonFaneId = "innboks" | "utkast" | "sendt" | "maler";

export type KommunikasjonFane = {
  id: KommunikasjonFaneId;
  label: string;
  /** Adressen fanen erstattet — kilden til redirecten. null = fanen fantes ikke som egen adresse (den er et statusfilter på en delt datakilde). */
  gammelHref: string | null;
};

/** Rekkefølgen er visningsrekkefølgen, godkjent i designsystem/canvas/agencyos-ia/Kommunikasjon.dc.html. */
export const KOMMUNIKASJON_FANER: KommunikasjonFane[] = [
  { id: "innboks", label: "Innboks", gammelHref: "/admin/innboks" },
  { id: "utkast", label: "Utkast", gammelHref: "/admin/innboks-epost" },
  { id: "sendt", label: "Sendt", gammelHref: null },
  { id: "maler", label: "Maler", gammelHref: "/admin/email-templates" },
];

export const KOMMUNIKASJON_STANDARDFANE: KommunikasjonFaneId = "innboks";

/** Er `s` en kjent fane-id? Brukes på `?fane=`-parameteren. */
export function erKommunikasjonFaneId(s: string | undefined): s is KommunikasjonFaneId {
  return s !== undefined && KOMMUNIKASJON_FANER.some((f) => f.id === s);
}

/**
 * Hvilken fane skal vises? Ukjent, manglende eller ukjent `?fane=` faller
 * tilbake til standardfanen — alle fire faner er synlige for alle med
 * sidens basisgate.
 */
export function velgKommunikasjonFane(onsket: string | undefined): KommunikasjonFaneId {
  return erKommunikasjonFaneId(onsket) ? onsket : KOMMUNIKASJON_STANDARDFANE;
}

/** `/admin/kommunikasjon?fane=<id>` — standardfanen får ren adresse uten parameter. */
export function kommunikasjonHref(fane: KommunikasjonFaneId): string {
  return fane === KOMMUNIKASJON_STANDARDFANE ? "/admin/kommunikasjon" : `/admin/kommunikasjon?fane=${fane}`;
}
