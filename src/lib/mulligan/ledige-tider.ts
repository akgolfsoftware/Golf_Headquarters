/**
 * Ren, testbar utregning av ledige tidsvinduer for Mulligan-triagen —
 * gitt en liste travle perioder (fra Google Calendar) og en periode å se på,
 * regn ut hvilke deler av åpningstiden som er FRI hver dag.
 *
 * Ingen nettverk, ingen Google-API her (det skjer i
 * scripts/mulligan-triage/kalender.ts) — todeling følger samme mønster som
 * kalenderNavnMatcher (ren) vs. kalenderAgenda (API-kall) i
 * src/lib/meg/connectors/google.ts.
 *
 * Tidssone: all dag-/klokkeslett-matte skjer via Intl.DateTimeFormat med
 * timeZone "Europe/Oslo" — ALDRI rå getDay()/setHours() på en lokal Date
 * (jf. .claude/rules/gotchas.md, "Tidssone"-gotchaen).
 */

export type Tidsvindu = { start: Date; slutt: Date };

// Foreløpig antakelse — BEKREFT mot Mulligan Indoor Golfs faktiske
// åpningstider før scriptet settes i fast drift. Enkel konstant med vilje,
// ikke ukedag-avhengig ennå.
export const APNINGSTID_START = 10;
export const APNINGSTID_SLUTT = 21;

/** "YYYY-MM-DD" for et gitt tidspunkt, i Oslo lokal tid. */
function osloDatoNoekkel(dato: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Oslo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(dato);
}

/** Oslo UTC-offset (minutter) på et gitt tidspunkt — håndterer sommer/vintertid. */
function osloOffsetMinutter(dato: Date): number {
  const del = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Oslo",
    timeZoneName: "shortOffset",
  })
    .formatToParts(dato)
    .find((p) => p.type === "timeZoneName")?.value;
  const treff = del?.match(/GMT([+-]\d+)(?::(\d+))?/);
  if (!treff) return 0;
  const timer = parseInt(treff[1], 10);
  const minutter = treff[2] ? parseInt(treff[2], 10) : 0;
  return timer * 60 + (timer < 0 ? -minutter : minutter);
}

/**
 * Bygger UTC-tidspunktet for et gitt heltalls klokkeslett (0–23) på en gitt
 * Oslo-dato-nøkkel ("YYYY-MM-DD"). Trygg for Mulligans åpningstider fordi
 * Oslo aldri bytter sommer-/vintertid midt på dagen (kun natt til søndag i
 * mars/oktober) — et grovt UTC-gjett nær riktig dato er nok til å slå opp
 * korrekt offset.
 */
function osloKlokkeslettTilUtc(datoNoekkel: string, klokkeslett: number): Date {
  const [aar, maaned, dag] = datoNoekkel.split("-").map(Number);
  const grovtGjett = new Date(Date.UTC(aar, maaned - 1, dag, klokkeslett, 0, 0));
  const offset = osloOffsetMinutter(grovtGjett);
  return new Date(grovtGjett.getTime() - offset * 60_000);
}

/** Lister unike Oslo-dato-nøkler ("YYYY-MM-DD") som overlapper [fraDato, tilDato]. */
function enumererOsloDager(fraDato: Date, tilDato: Date): string[] {
  const dager: string[] = [];
  let sisteNoekkel: string | null = null;
  let cursorMs = fraDato.getTime();
  const sluttMs = tilDato.getTime();
  let sikkerhet = 0;
  // Steg i 6-timers hopp — garanterer at vi aldri hopper over en dato-grense,
  // og er billig nok selv for lange perioder (sikkerhetstak: ~100 dager).
  while (cursorMs <= sluttMs && sikkerhet < 400) {
    const noekkel = osloDatoNoekkel(new Date(cursorMs));
    if (noekkel !== sisteNoekkel) {
      dager.push(noekkel);
      sisteNoekkel = noekkel;
    }
    cursorMs += 6 * 60 * 60 * 1000;
    sikkerhet++;
  }
  return dager;
}

/**
 * Regner ut ledige tidsvinduer i [fraDato, tilDato], begrenset til
 * åpningstiden [apningStart, apningSlutt) hver Oslo-kalenderdag, minus
 * travlePerioder. Overlappende/tilstøtende travle perioder slås sammen før
 * gapene regnes ut. Rekkefølgen på travlePerioder spiller ingen rolle.
 *
 * Kant-tilfeller:
 * - Ingen travle perioder en dag → hele åpningsvinduet er ledig.
 * - Åpningsvinduet er helt dekket av travle perioder → ingen vinduer for dagen.
 * - fraDato/tilDato midt i en dag klipper vinduet til det faktiske intervallet.
 */
export function regnUtLedigeVinduer(
  travlePerioder: Tidsvindu[],
  fraDato: Date,
  tilDato: Date,
  apningStart: number = APNINGSTID_START,
  apningSlutt: number = APNINGSTID_SLUTT,
): Tidsvindu[] {
  if (tilDato <= fraDato || apningSlutt <= apningStart) return [];

  const resultat: Tidsvindu[] = [];

  for (const dagNoekkel of enumererOsloDager(fraDato, tilDato)) {
    const dagStart = osloKlokkeslettTilUtc(dagNoekkel, apningStart);
    const dagSlutt = osloKlokkeslettTilUtc(dagNoekkel, apningSlutt);
    if (dagSlutt <= dagStart) continue;

    const vindusStart = dagStart < fraDato ? fraDato : dagStart;
    const vindusSlutt = dagSlutt > tilDato ? tilDato : dagSlutt;
    if (vindusSlutt <= vindusStart) continue;

    const overlappende = travlePerioder
      .filter((p) => p.slutt > vindusStart && p.start < vindusSlutt)
      .map((p) => ({
        start: p.start < vindusStart ? vindusStart : p.start,
        slutt: p.slutt > vindusSlutt ? vindusSlutt : p.slutt,
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    const sammenslaatt: Tidsvindu[] = [];
    for (const p of overlappende) {
      const siste = sammenslaatt[sammenslaatt.length - 1];
      if (siste && p.start.getTime() <= siste.slutt.getTime()) {
        if (p.slutt.getTime() > siste.slutt.getTime()) siste.slutt = p.slutt;
      } else {
        sammenslaatt.push({ start: p.start, slutt: p.slutt });
      }
    }

    let markoer = vindusStart;
    for (const p of sammenslaatt) {
      if (p.start.getTime() > markoer.getTime()) {
        resultat.push({ start: markoer, slutt: p.start });
      }
      if (p.slutt.getTime() > markoer.getTime()) markoer = p.slutt;
    }
    if (markoer.getTime() < vindusSlutt.getTime()) {
      resultat.push({ start: markoer, slutt: vindusSlutt });
    }
  }

  return resultat;
}
