/**
 * Testhjelper for tidssone-følsom kode (steg 6 i `docs/plan-testdekning.md`).
 *
 * Feilklassen dette fanger er den dyreste i repoet fordi den er USYNLIG lokalt:
 * utvikleren sitter i Oslo, Vercel kjører UTC, og `tsc` ser aldri forskjellen.
 * `gotchas.md` dokumenterer tre separate treff — `session-move-math` (uke/dag
 * regnet fra rå `getDay()` nær midnatt), `periode-core` (17.8 ble lagret som
 * 16.8 fra lokal maskin), og den generelle Oslo-vs-UTC-notisen.
 *
 * Hver gang var svaret en regresjonstest for akkurat den filen som brakk.
 * Denne hjelperen gjør det billig å teste HELE klassen i stedet: kjør samme
 * påstand i de fire vinduene der Oslo og UTC faktisk spriker.
 *
 * Bruk:
 *
 *   import { iAlleTidsvinduer } from "../_hjelpere/tid";
 *
 *   test("ukestart er mandag uansett tidssone", () => {
 *     iAlleTidsvinduer((vindu) => {
 *       assert.equal(startOfWeek(vindu.na).getDay(), 1, vindu.navn);
 *     });
 *   });
 *
 * NB: hjelperen endrer IKKE prosessens tidssone (`process.env.TZ` er lest én
 * gang av Node ved oppstart, og å sette den midt i en kjøring gir upålitelige
 * resultater på tvers av plattformer). Den gir deg i stedet konkrete
 * tidspunkter der forskjellen materialiserer seg, og lar testen sammenligne
 * Oslo-tolkningen mot UTC-tolkningen eksplisitt.
 */

export type Tidsvindu = {
  /** Menneskelesbart navn — send den med som assert-melding. */
  navn: string;
  /** Tidspunktet, som ekte Date (UTC-instans). */
  na: Date;
  /** Hva klokka er i Oslo på dette tidspunktet, «YYYY-MM-DD HH:mm». */
  osloTekst: string;
  /** Hva klokka er i UTC på samme tidspunkt. */
  utcTekst: string;
  /** True når Oslo og UTC ligger på ULIKE kalenderdatoer. */
  ulikDato: boolean;
};

const OSLO = "Europe/Oslo";

function formater(d: Date, tz: string): string {
  const f = new Intl.DateTimeFormat("sv-SE", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  // sv-SE gir «2026-01-15 23:30» — ISO-likt og stabilt å sammenligne.
  return f.format(d).replace("T", " ");
}

/** Kalenderdato i en gitt sone, «YYYY-MM-DD». */
export function datoIsone(d: Date, tz: string = OSLO): string {
  return formater(d, tz).slice(0, 10);
}

function lagVindu(navn: string, iso: string): Tidsvindu {
  const na = new Date(iso);
  const osloTekst = formater(na, OSLO);
  const utcTekst = formater(na, "UTC");
  return {
    navn,
    na,
    osloTekst,
    utcTekst,
    ulikDato: osloTekst.slice(0, 10) !== utcTekst.slice(0, 10),
  };
}

/**
 * De fire vinduene der Oslo og UTC spriker på måter som har brukket kode før.
 *
 * Vinter (UTC+1) og sommer (UTC+2) dekker begge offsetene; de to
 * DST-overgangene dekker helgene der offset ENDRER seg midt i uka — det var
 * der `session-move-math` var mest utsatt, siden en ukeberegning kan krysse
 * overgangen.
 */
export const TIDSVINDUER: Tidsvindu[] = [
  // 15. januar 23:30 Oslo = 22:30 UTC samme dag (offset +1). Ikke ulik dato,
  // men ulik TIME — nok til å flytte en `setHours(0,0,0,0)`-beregning.
  lagVindu("vinter 23:30 Oslo (UTC+1)", "2026-01-15T22:30:00Z"),
  // 15. juli 00:30 Oslo = 22:30 UTC DAGEN FØR (offset +2). Her spriker datoen.
  lagVindu("sommer 00:30 Oslo = forrige dag UTC (UTC+2)", "2026-07-14T22:30:00Z"),
  // DST-start 2026: natt til søndag 29. mars, klokka stilles 02→03.
  lagVindu("DST vår — overgangsnatten", "2026-03-29T00:30:00Z"),
  // DST-slutt 2026: natt til søndag 25. oktober, klokka stilles 03→02.
  lagVindu("DST høst — overgangsnatten", "2026-10-25T00:30:00Z"),
];

/**
 * Kjør samme påstand i alle fire vinduene. Feiler påstanden i ett av dem,
 * forteller assert-meldingen hvilket.
 */
export function iAlleTidsvinduer(fn: (vindu: Tidsvindu) => void): void {
  for (const vindu of TIDSVINDUER) fn(vindu);
}

/**
 * Vinduene der Oslo og UTC ligger på ULIKE kalenderdatoer. Bruk denne når
 * påstanden handler om dato-drift spesifikt (17.8 → 16.8-klassen).
 */
export function iVinduerMedDatoAvvik(fn: (vindu: Tidsvindu) => void): void {
  const med = TIDSVINDUER.filter((v) => v.ulikDato);
  if (med.length === 0) {
    throw new Error(
      "Ingen vinduer med dato-avvik — hjelperen er feilkonfigurert",
    );
  }
  for (const vindu of med) fn(vindu);
}
