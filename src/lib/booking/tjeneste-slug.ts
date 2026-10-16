/**
 * Slug for en tjeneste (/booking/[slug]) fra navnet. Norsk-normalisert:
 * NFD-dekomponering fjerner diakritiske tegn før ø/æ/å-reglene, så «på» blir
 * «pa» og «Ærfugl» blir «aerfugl». Tom streng når navnet ikke har bokstaver
 * eller tall.
 */
export function lagTjenesteSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ø/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/å/g, "aa")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
