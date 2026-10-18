/**
 * Kategori på en tjeneste (bookingplanen steg 2, 15.10.2026). Brukes til
 * gruppering på BK-01 («Fast oppfølging» mot vanlige timer) og i AgencyOS.
 *
 * Verdiene lagres som tekst i `ServiceType.kategori`. Null betyr «ikke satt»:
 * da gjettes abonnement fra navnet, slik BK-01 gjorde før feltet fantes.
 */

export const TJENESTE_KATEGORIER = [
  { verdi: "drop-in", navn: "Drop-in (Flex)" },
  { verdi: "abonnement", navn: "Abonnement (Performance)" },
  { verdi: "duo", navn: "Duo (to deltakere)" },
  { verdi: "gruppe", navn: "Gruppe" },
  { verdi: "annet", navn: "Annet" },
] as const;

export type TjenesteKategori = (typeof TJENESTE_KATEGORIER)[number]["verdi"];

export function erTjenesteKategori(v: unknown): v is TjenesteKategori {
  return TJENESTE_KATEGORIER.some((k) => k.verdi === v);
}

export function kategoriNavn(kategori: string | null): string {
  return TJENESTE_KATEGORIER.find((k) => k.verdi === kategori)?.navn ?? "Ikke satt";
}

/**
 * Er tjenesten et abonnement (vises under «Fast oppfølging» på BK-01)?
 * Kategorien avgjør når den er satt. Uten kategori: navnesjekk på
 * «performance», som før feltet fantes.
 */
export function erAbonnementTjeneste(t: { kategori: string | null; name: string }): boolean {
  if (t.kategori) return t.kategori === "abonnement";
  return t.name.toLowerCase().includes("performance");
}

/**
 * Er tjenesten en duo-time (to deltakere, én betaler, bookingplanen steg 6)?
 * Kategorien avgjør når den er satt. Uten kategori: ordet «duo» i navnet,
 * slik Acuity-tjenestene heter («Flex Duo 50 min»).
 */
export function erDuoTjeneste(t: { kategori: string | null; name: string }): boolean {
  if (t.kategori) return t.kategori === "duo";
  return /\bduo\b/i.test(t.name);
}
