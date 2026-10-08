/**
 * Rydder en spillers resultatliste før den vises på den åpne spillerprofilen.
 *
 * Tre regler, i denne rekkefølgen:
 *
 *  1. DataGolf vises aldri. Lisensen er personlig og ikke-kommersiell, og den
 *     forbyr videreformidling (Anders' beslutning 21.09.2026).
 *  2. Samme turnering ligger ofte to ganger. Én kopi er fra NGF, den andre fra
 *     tourens egen kilde (GolfBox: Srixon, Norgescup, Østlandstour osv.). Kopiene
 *     slås sammen til én rad. GolfBox-kopien sin score vinner alltid. Grunnen er
 *     at NGF-kopien i en del turneringer har nettoscore uten å merke det
 *     (International Trophy: hver runde 8 slag under GolfBox sin bruttoscore).
 *     NGF sin plassering brukes bare når GolfBox mangler plassering OG totalene
 *     stemmer.
 *  3. Bare brutto. Nettoklasser fjernes. Er GolfBox-kopien i en nettoklasse,
 *     fjernes NGF-kopien av samme turnering også, siden den da har nettoscoren.
 *
 * Regelen for nettoklasser speiler `is_netto_class` i ak-golf-pipelines
 * (`pipelines/common/class_code_allowlist.py`).
 */

export type ProfilEntry = {
  id: string;
  status: string;
  position: number | null;
  scoreToPar: number | null;
  totalScore: number | null;
  klasseNavn: string | null;
  rounds: unknown;
  tournament: {
    sourceOrigin: string | null;
    startDate: Date;
  };
};

const NETTO_SUFFIKSER = ["N", "NETTO", "-N", "_N", "(N)", "n", "(n)"] as const;

/** True hvis klassenavnet eksplisitt er netto («Herrer Netto», «G19N», «G15 (N)»). */
export function erNettoKlasse(klasseNavn: string | null | undefined): boolean {
  const kode = klasseNavn?.trim();
  if (!kode) return false;
  if (/netto/i.test(kode)) return true;
  for (const suffiks of NETTO_SUFFIKSER) {
    if (!kode.endsWith(suffiks)) continue;
    // «N» alene teller bare etter et siffer (G19N). «A-klassen» ender på n, men er brutto.
    if ((suffiks === "N" || suffiks === "n") && kode.length > 1 && !/\d/.test(kode[kode.length - 2])) {
      continue;
    }
    return true;
  }
  return false;
}

/**
 * Rundescorer fra `rounds`-feltet. Støtter begge formatene i basen:
 * NGF-listen `[{ n, score }]` og GolfBox v2 `{ roundScores: [..] }`.
 */
export function parseRunder(rounds: unknown): { n: number; score: number }[] {
  if (!rounds || typeof rounds !== "object") return [];
  if (Array.isArray(rounds)) {
    return (rounds as { n?: unknown; score?: unknown }[])
      .filter((r): r is { n: number; score: number } => typeof r?.n === "number" && typeof r?.score === "number")
      .sort((a, b) => a.n - b.n)
      .map((r) => ({ n: r.n, score: r.score }));
  }
  const scores = (rounds as { roundScores?: unknown }).roundScores;
  if (!Array.isArray(scores)) return [];
  return scores.flatMap((score, i) => (typeof score === "number" ? [{ n: i + 1, score }] : []));
}

function dag(d: Date): string {
  return new Date(d).toISOString().slice(0, 10);
}

function sumRunder(entry: ProfilEntry): number | null {
  const runder = parseRunder(entry.rounds);
  return runder.length > 0 ? runder.reduce((s, r) => s + r.score, 0) : null;
}

/** Slår NGF-kopien inn i GolfBox-kopien. GolfBox-kopien sin score vinner. */
function slaaSammen<T extends ProfilEntry>(golfbox: T, ngf: T): T {
  const golfboxTotal = golfbox.totalScore ?? sumRunder(golfbox);
  const totalerStemmer = golfboxTotal === null || golfboxTotal === ngf.totalScore;
  const harRunder = parseRunder(golfbox.rounds).length > 0;
  return {
    ...golfbox,
    totalScore: golfboxTotal ?? ngf.totalScore,
    position: golfbox.position ?? (totalerStemmer ? ngf.position : null),
    rounds: harRunder ? golfbox.rounds : ngf.rounds,
  };
}

/** Ryddet resultatliste for én spiller. Rekkefølgen beholdes. */
export function ryddProfilResultater<T extends ProfilEntry>(entries: T[]): T[] {
  const utenDataGolf = entries.filter((e) => e.tournament.sourceOrigin !== "DATAGOLF");

  const ngfPerDag = new Map<string, T[]>();
  for (const e of utenDataGolf) {
    if (e.tournament.sourceOrigin !== "NGF") continue;
    const k = dag(e.tournament.startDate);
    ngfPerDag.set(k, [...(ngfPerDag.get(k) ?? []), e]);
  }

  const brukteNgf = new Set<string>();
  const sammenslatt = new Map<string, T>();
  const fjernes = new Set<string>();
  for (const e of utenDataGolf) {
    if (e.tournament.sourceOrigin === "NGF") continue;
    const kandidater = (ngfPerDag.get(dag(e.tournament.startDate)) ?? []).filter((n) => !brukteNgf.has(n.id));
    if (kandidater.length === 0) continue;
    const total = e.totalScore ?? sumRunder(e);
    const ngf = kandidater.find((n) => n.totalScore === total) ?? kandidater[0];
    brukteNgf.add(ngf.id);
    fjernes.add(ngf.id);
    sammenslatt.set(e.id, slaaSammen(e, ngf));
  }

  return utenDataGolf
    .filter((e) => !fjernes.has(e.id) && !erNettoKlasse(e.klasseNavn))
    .map((e) => sammenslatt.get(e.id) ?? e);
}
