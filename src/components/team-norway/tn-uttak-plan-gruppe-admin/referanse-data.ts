import { AK_BANDS } from "@/lib/domain/ak-kategori";
import type { TnProtocol } from "@/lib/portal-tester/tn-catalog";

/**
 * Rene hjelpere for TN-18 Referansenivåer. Ingen database: protokollene
 * kommer fra den versjonerte katalogen (tn-catalog.ts), kategoriene fra
 * ak-kategori.ts. Landslagsnormen finnes ikke i noen kilde og er alltid null.
 */

export const TN_KLASSER = ["Gutter U18", "Jenter U18", "Damer", "Herrer"] as const;
export type TnKlasse = (typeof TN_KLASSER)[number];

/** Leser klassevalget fra adressen. Ukjent verdi gir første klasse. */
export function lesKlasse(verdi: string | string[] | undefined): number {
  const n = Number(Array.isArray(verdi) ? verdi[0] : verdi);
  return Number.isInteger(n) && n >= 0 && n < TN_KLASSER.length ? n : 0;
}

const erJenteklasse = (klasse: TnKlasse) => klasse === "Jenter U18" || klasse === "Damer";

/**
 * Protokoller med egen variant for gutter eller jenter vises bare i klassene
 * varianten gjelder. Protokoller uten kjønnsvariant gjelder alle klasser.
 */
export function gjelderKlasse(navn: string, klasse: TnKlasse): boolean {
  const gutt = /\bgutter\b/i.test(navn);
  const jente = /\bjenter\b/i.test(navn);
  if (!gutt && !jente) return true;
  return erJenteklasse(klasse) ? jente : gutt;
}

/** «tn-excel-v3-2026-09-10» → «v3». Ukjent format gir hele strengen. */
export function kortVersjon(versjon: string): string {
  return versjon.match(/-v(\d+)-/)?.[0].slice(1, -1) ?? versjon;
}

/** Enhetene protokollen registrerer, i den rekkefølgen de står. «—» uten enhet. */
export function enheter(protokoll: Pick<TnProtocol, "rows">): string {
  const alle = protokoll.rows.flatMap((r) => r.fields).filter((f) => !f.optional).map((f) => f.unit).filter((u): u is string => Boolean(u));
  const unike = [...new Set(alle)];
  return unike.length ? unike.join(" · ") : "—";
}

export type ReferanseRad = { id: string; navn: string; enhet: string; forsok: number; utkast: boolean; landslag: null };

export function lagReferanseRader(katalog: readonly TnProtocol[], klasse: TnKlasse): ReferanseRad[] {
  return katalog
    .filter((p) => gjelderKlasse(p.name, klasse))
    .map((p) => ({ id: p.id, navn: p.name, enhet: enheter(p), forsok: p.rows.length, utkast: Boolean(p.blocked), landslag: null }));
}

/** AK Golf-kategoriene med grensene slik tegningen skriver dem: [min, maks). */
export function akKategoriRader() {
  return AK_BANDS.map((b) => ({
    kategori: b.kategori,
    niva: b.niva,
    grenser: b.min === null ? `under ${b.max}` : b.max === null ? `${b.min}+` : `${b.min}–${b.max}`,
  }));
}
