// Ren beregning (ingen prisma) av timevolum og reell pyramidefordeling for en
// PlanTemplate — driver volum-linjen i mal-editoren. Løser gapet der coach
// aldri fikk se sum-timer, og pyramide-% (glidere) og faktiske øktminutter
// levde hver sitt liv uten sammenligning.

import type { PyramidArea } from "@/generated/prisma/client";

export interface VolumSesjon {
  ukeNr: number;
  varighetMin: number;
  pyramidArea: PyramidArea;
}

/** Fraksjoner 0–1 per pyramideområde (samme form som DisciplinFordeling). */
export type Fordeling = Record<PyramidArea, number>;

export interface TemplateVolum {
  /** Minutter planlagt per uke, index 0 = uke 1. 0 for uker uten økter. */
  minPerUke: number[];
  /** Snitt minutter/uke — tomme uker teller i nevneren (deler på varighetUker). */
  snittMinPerUke: number;
  /** «≈ 6,5 t/uke», komma-desimal. «—» for tom mal (ingen økter). */
  timerLabel: string;
  /** Reell fordeling i % av totale minutter, avrundet (kan avvike ±1 fra 100 pga. avrunding). */
  realisertProsent: Record<PyramidArea, number>;
  /** Størst avvik (prosentpoeng) mellom glider-% og reell %. Null for tom mal. */
  storsteAvvik: { omrade: PyramidArea; diffPp: number } | null;
}

const PYR_ALLE: PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

function formatTimerLabel(minutter: number): string {
  const timer = minutter / 60;
  const avrundet = Math.round(timer * 10) / 10;
  return `≈ ${avrundet.toFixed(1).replace(".", ",")} t/uke`;
}

export function beregnTemplateVolum(
  sessions: VolumSesjon[],
  varighetUker: number,
  fordeling: Fordeling,
): TemplateVolum {
  const minPerUke = Array.from({ length: Math.max(0, varighetUker) }, () => 0);
  const minPerOmrade: Record<PyramidArea, number> = { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 };
  let totalMin = 0;

  for (const s of sessions) {
    if (s.ukeNr >= 1 && s.ukeNr <= varighetUker) {
      minPerUke[s.ukeNr - 1] += s.varighetMin;
    }
    minPerOmrade[s.pyramidArea] += s.varighetMin;
    totalMin += s.varighetMin;
  }

  if (sessions.length === 0 || totalMin === 0) {
    return {
      minPerUke,
      snittMinPerUke: 0,
      timerLabel: "—",
      realisertProsent: { FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 },
      storsteAvvik: null,
    };
  }

  const snittMinPerUke = varighetUker > 0 ? totalMin / varighetUker : 0;
  const realisertProsent = Object.fromEntries(
    PYR_ALLE.map((a) => [a, Math.round((minPerOmrade[a] / totalMin) * 100)]),
  ) as Record<PyramidArea, number>;

  let storsteAvvik: TemplateVolum["storsteAvvik"] = null;
  for (const a of PYR_ALLE) {
    const gliderPct = Math.round(fordeling[a] * 100);
    const diffPp = Math.abs(realisertProsent[a] - gliderPct);
    if (!storsteAvvik || diffPp > storsteAvvik.diffPp) {
      storsteAvvik = { omrade: a, diffPp };
    }
  }

  return {
    minPerUke,
    snittMinPerUke,
    timerLabel: formatTimerLabel(snittMinPerUke),
    realisertProsent,
    storsteAvvik,
  };
}
