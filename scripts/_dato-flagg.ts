/**
 * Delt `--dato=YYYY-MM-DD`-tolkning for seed-scriptene
 * (seed-screentest-komplett.ts, seed-screentest-coach.ts) — fryser
 * "kjøredato" til en bestemt dag for sign-off-riggen (fase 1, økt 3;
 * tests/visual/skjerm-mapping.ts sitt testDato-felt dokumenterer hvilken
 * dato en rad forventer demo-dataene anchoret på). Uten flagget: uendret
 * oppførsel, ekte kjøredato.
 *
 * Rene funksjoner, ingen sideeffekter — trygt å importere fra en test.
 * IKKE importer seed-scriptene selv fra en test: de mangler en
 * import.meta.url-vakt og starter ekte database-seeding ved import.
 */

/** Finner rå verdien etter "=" i `--dato=<verdi>`, eller null om flagget mangler. */
export function finnDatoFlagg(argv: string[]): string | null {
  const flagg = argv.find((a) => a.startsWith("--dato="));
  return flagg ? flagg.slice("--dato=".length) : null;
}

/**
 * Bygger kl. 12:00 LOKALT fra en YYYY-MM-DD-streng — 12:00 unngår
 * midnatt-kanten mot UTC (samme kantsak som gotchas.md §Dato-strenger MÅ
 * bruke UTC-midnatt). Null ved ugyldig format.
 */
export function byggKjoredato(verdi: string): Date | null {
  const dato = new Date(`${verdi}T12:00:00`);
  return Number.isNaN(dato.getTime()) ? null : dato;
}

/**
 * Leser `--dato=` fra argv; uten flagget: ekte kjøredato (`new Date()`).
 * Kaster ved ugyldig format — scriptet fanger dette selv og avslutter med
 * en lesbar feilmelding (se seed-screentest-komplett.ts / -coach.ts).
 */
export function losKjoredato(argv: string[]): Date {
  const verdi = finnDatoFlagg(argv);
  if (!verdi) return new Date();
  const dato = byggKjoredato(verdi);
  if (!dato) throw new Error(`Ugyldig --dato: "${verdi}" — bruk YYYY-MM-DD.`);
  return dato;
}
