export type PeriodeKandidat = { type: string; start: string; slutt: string; fokus: string | null; budsjett: unknown };

const dagerMellom = (a: string, b: string) => Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86_400_000) + 1;

/** Perioden med flest dager i måneden (ved likt: den som starter først). Null når ingen overlapper. */
export function velgPeriode(kandidater: readonly PeriodeKandidat[], monthStart: string, monthEnd: string): PeriodeKandidat | null {
  let beste: PeriodeKandidat | null = null;
  let flest = 0;
  for (const k of kandidater) {
    const fra = k.start > monthStart ? k.start : monthStart;
    const til = k.slutt < monthEnd ? k.slutt : monthEnd;
    const dager = til >= fra ? dagerMellom(fra, til) : 0;
    if (dager > flest) { flest = dager; beste = k; }
  }
  return beste;
}
