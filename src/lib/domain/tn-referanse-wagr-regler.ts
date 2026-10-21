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
      };
    })
    .sort((a, b) => (a.plass ?? Number.MAX_SAFE_INTEGER) - (b.plass ?? Number.MAX_SAFE_INTEGER) || a.navn.localeCompare(b.navn, "nb"));
}
