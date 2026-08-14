/**
 * Kanonisk typografi-skala for AK Golf HQ — utledet fra Paper-fasiten
 * (designsystem/paper fase1+fase2). Forklaring: docs/port/typografi-skala-paper.md.
 * Dette er DEN ENE maskinlesbare kilden — vakten (check-typografi.mjs) og
 * kvalitet.mjs leser herfra.
 */

export const SKALA_PX = [
  8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 14.5, 15, 15.5,
  16, 17, 18, 19, 20, 22, 24, 26, 28, 32, 34, 36, 40,
];

/** Verdier fra og med denne er fri display-sone (marketing-heroer m.m.). */
export const DISPLAY_FRA_PX = 44;

/**
 * Filer unntatt vakten: @react-pdf/renderer-dokumenter måler i punkter på
 * papir, ikke skjermtypografi — skalaen gjelder ikke der.
 */
export const UNNTAK = [/pdf-export\.tsx$/, /faktura-document\.tsx$/, /\/pdf\//];

export function erUnntatt(sti) {
  return UNNTAK.some((re) => re.test(sti));
}

const SETT = new Set(SKALA_PX);

/** Er en px-verdi innenfor skalaen (eller i display-sonen)? */
export function iSkala(px) {
  return px >= DISPLAY_FRA_PX || SETT.has(px);
}

/**
 * Finn inline fontSize-deklarasjoner utenfor skalaen i en kildetekst.
 * Fanger `fontSize: 13`, `fontSize: "13px"`, `fontSize: '13.5px'`.
 * Rem/em/var()/tokens ignoreres — vakten gjelder kun px-tall.
 * Returnerer [{ linje, verdi, tekst }].
 */
export function finnAvvik(kilde) {
  const avvik = [];
  const linjer = kilde.split("\n");
  const re = /fontSize:\s*(?:"([0-9.]+)(?:px)?"|'([0-9.]+)(?:px)?'|([0-9.]+))(?=\s*[,}\s])/g;
  for (let i = 0; i < linjer.length; i++) {
    for (const m of linjer[i].matchAll(re)) {
      const px = Number(m[1] ?? m[2] ?? m[3]);
      if (!Number.isFinite(px) || px < 4) continue; // 0.5 o.l. er rem/feiltreff, ikke px-tekst
      if (!iSkala(px)) avvik.push({ linje: i + 1, verdi: px, tekst: m[0] });
    }
  }
  return avvik;
}
