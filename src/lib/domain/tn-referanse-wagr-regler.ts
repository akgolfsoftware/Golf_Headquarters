/**
 * Rene regler for Referanse › WAGR, uten databasen, så de kan låses med test.
 * Henting ligger i tn-referanse-wagr.ts.
 */

export const WAGR_KILDE = "World Amateur Golf Ranking (WAGR), The R&A";

export type WagrRefGruppe = { id: string; navn: string; tittel: string | null; utvalg: string | null; kunAar: number | null; wagrDato: Date };

export type WagrRefMedlem = {
  nivaa: number | null;
  wagrId: number;
  navn: string;
  land: string;
  plass: number | null;
  snittPoeng: number | null;
  bestePlass: number | null;
  seire: number | null;
  /** {"2025": 846}, slik pipelines skriver det */
  aarsslutt: unknown;
  sisteTurnering: { name: string; date: Date | null; finish: string | null } | null;
};

export type WagrRefSpillerRad = {
  wagrId: number;
  navn: string;
  land: string;
  nivaa: number | null;
  plass: number | null;
  /** Plass ved forrige årsslutt */
  plassAarsslutt: number | null;
  /** Plasser opp siden forrige årsslutt; negativ er ned. null når et av tallene mangler. */
  endring: number | null;
  snittPoeng: number | null;
  bestePlass: number | null;
  seire: number | null;
  sisteTurnering: { navn: string; dato: Date | null; plassering: string | null } | null;
  /** WAGR-plass år for år, til grafen. */
  aarForAar: WagrAarPunkt[];
};

/** Plass ved årsslutt for et gitt år, eller null. Pipelines skriver nøklene som tekst. */
export function plassVedAarsslutt(aarsslutt: unknown, aar: number): number | null {
  if (!aarsslutt || typeof aarsslutt !== "object" || Array.isArray(aarsslutt)) return null;
  const v = (aarsslutt as Record<string, unknown>)[String(aar)];
  return typeof v === "number" && Number.isFinite(v) && v > 0 ? v : null;
}

/**
 * Leaderboardet: én rad per spiller, sortert på WAGR-plass (spillere uten plass sist).
 * Endringen er mot årsslutt året før rankinguka, som på teamnorwayref.
 */
export function byggWagrLeaderboard(medlemmer: WagrRefMedlem[], wagrDato: Date): WagrRefSpillerRad[] {
  const ifjor = wagrDato.getUTCFullYear() - 1;
  return medlemmer
    .map((m) => {
      const plassAarsslutt = plassVedAarsslutt(m.aarsslutt, ifjor);
      return {
        wagrId: m.wagrId,
        navn: m.navn,
        land: m.land,
        nivaa: m.nivaa,
        plass: m.plass,
        plassAarsslutt,
        endring: m.plass != null && plassAarsslutt != null ? plassAarsslutt - m.plass : null,
        snittPoeng: m.snittPoeng,
        bestePlass: m.bestePlass,
        seire: m.seire,
        sisteTurnering: m.sisteTurnering ? { navn: m.sisteTurnering.name, dato: m.sisteTurnering.date, plassering: m.sisteTurnering.finish } : null,
        aarForAar: wagrAarForAar(m.aarsslutt, m.plass, wagrDato),
      };
    })
    .sort((a, b) => (a.plass ?? Number.MAX_SAFE_INTEGER) - (b.plass ?? Number.MAX_SAFE_INTEGER) || a.navn.localeCompare(b.navn, "nb"));
}

/** Inntil fire unike WAGR-ID-er fra adressen (`?id=1&id=2`). Alt annet ignoreres. */
export function parseWagrIder(verdi: string | string[] | undefined, maks = 4): number[] {
  const liste = Array.isArray(verdi) ? verdi : verdi ? [verdi] : [];
  const ider: number[] = [];
  for (const v of liste) {
    const n = Number(v);
    if (Number.isInteger(n) && n > 0 && !ider.includes(n)) ider.push(n);
    if (ider.length === maks) break;
  }
  return ider;
}

export type WagrAarPunkt = { aar: number; plass: number };

/**
 * WAGR-plass år for år: plassen ved årsslutt (uke 52) for tidligere år, og plassen nå for rankinguka sitt år.
 * Eldst først. År uten plass er ikke med.
 */
export function wagrAarForAar(aarsslutt: unknown, plassNaa: number | null, wagrDato: Date): WagrAarPunkt[] {
  const iAar = wagrDato.getUTCFullYear();
  const punkter: WagrAarPunkt[] = [];
  if (aarsslutt && typeof aarsslutt === "object" && !Array.isArray(aarsslutt)) {
    for (const nokkel of Object.keys(aarsslutt)) {
      const aar = Number(nokkel);
      const plass = plassVedAarsslutt(aarsslutt, aar);
      if (Number.isInteger(aar) && aar < iAar && plass != null) punkter.push({ aar, plass });
    }
  }
  if (plassNaa != null && plassNaa > 0) punkter.push({ aar: iAar, plass: plassNaa });
  return punkter.sort((a, b) => a.aar - b.aar);
}

/** Snittscore for et år fra `yearStats` ({"2026": {score: 72.1, …}}). Null når tallet mangler. */
export function wagrAarsscore(aarsstatistikk: unknown, aar: number): number | null {
  if (!aarsstatistikk || typeof aarsstatistikk !== "object" || Array.isArray(aarsstatistikk)) return null;
  const rad = (aarsstatistikk as Record<string, unknown>)[String(aar)];
  if (!rad || typeof rad !== "object") return null;
  const score = (rad as Record<string, unknown>).score;
  return typeof score === "number" && Number.isFinite(score) && score > 0 ? score : null;
}

/** Antall turneringer (WAGR-turnerings-ID) som alle de valgte spillerne har spilt. */
export function fellesTurneringer(perSpiller: number[][]): number {
  if (perSpiller.length < 2) return 0;
  const [forste, ...resten] = perSpiller.map((l) => new Set(l));
  return [...forste!].filter((id) => resten.every((s) => s.has(id))).length;
}

export type WagrVisning = "leaderboard" | "turneringer" | "sesong";

/** Visningsvalget i adressen (`?visning=`). Ukjent eller manglende verdi gir leaderboard. */
export function parseWagrVisning(verdi: string | string[] | undefined): WagrVisning {
  const v = Array.isArray(verdi) ? verdi[0] : verdi;
  return v === "turneringer" || v === "sesong" ? v : "leaderboard";
}

export type WagrResultatInn = {
  wagrId: number;
  spillerNavn: string;
  eventId: number;
  navn: string;
  dato: Date | null;
  finish: string | null;
  power: number | null;
  points: number | null;
  rankBefore: number | null;
  rankAfter: number | null;
};

/** Seier i WAGR: plassering «1» (eller «W»). Delt førsteplass («T1») regnes ikke som seier. */
export function erWagrSeier(finish: string | null): boolean {
  return finish != null && /^(1|w)$/i.test(finish.trim());
}

/** Alle turneringene spillerne har spilt, nyeste først (uten dato sist). Ved lik dato: turneringsnavn, så spiller. */
export function byggWagrTurneringer(resultater: WagrResultatInn[]): WagrResultatInn[] {
  return [...resultater].sort(
    (a, b) =>
      (b.dato?.getTime() ?? -Infinity) - (a.dato?.getTime() ?? -Infinity) ||
      a.navn.localeCompare(b.navn, "nb") ||
      a.spillerNavn.localeCompare(b.spillerNavn, "nb"),
  );
}

/** Antall ulike turneringer (WAGR-turnerings-ID) i resultatene. */
export function antallWagrTurneringer(resultater: WagrResultatInn[]): number {
  return new Set(resultater.map((r) => r.eventId)).size;
}

export type WagrSesongPrikk = { eventId: number; navn: string; dato: Date | null; finish: string | null; points: number | null; seier: boolean };
export type WagrSesongRad = { wagrId: number; navn: string; prikker: WagrSesongPrikk[]; seire: number };

/**
 * Sesongen: én rad per spiller i den rekkefølgen spillerne er gitt (leaderboard-rekkefølge), med én prikk per
 * turnering, eldst først. Spillere uten turneringer er med og får en tom rad.
 */
export function byggWagrSesong(spillere: { wagrId: number; navn: string }[], resultater: WagrResultatInn[]): WagrSesongRad[] {
  return spillere.map((s) => {
    const prikker = resultater
      .filter((r) => r.wagrId === s.wagrId)
      .map((r) => ({ eventId: r.eventId, navn: r.navn, dato: r.dato, finish: r.finish, points: r.points, seier: erWagrSeier(r.finish) }))
      .sort((a, b) => (a.dato?.getTime() ?? Infinity) - (b.dato?.getTime() ?? Infinity) || a.navn.localeCompare(b.navn, "nb"));
    return { wagrId: s.wagrId, navn: s.navn, prikker, seire: prikker.filter((p) => p.seier).length };
  });
}

/** Prikkstørrelse i piksler etter poeng: 10 px for færrest, 24 px for flest poeng. Uten poeng: 10 px. */
export function wagrPrikkStorrelse(poeng: number | null, maks: number): number {
  if (poeng == null || poeng <= 0 || maks <= 0) return 10;
  return Math.round(10 + 14 * Math.min(1, poeng / maks));
}
