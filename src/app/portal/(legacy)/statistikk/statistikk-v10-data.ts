/**
 * Mapper: ekte Prisma-runder → v10 StatistikkData (komponent-props).
 *
 * Delegerer SG-aggregering til aggregateSg() i src/lib/sg.ts (kanonisk kilde)
 * i stedet for å duplisere snitt/format-logikk lokalt.
 *
 * Tom-tilstand: når ingen runder har SG-data ⇒ metrikker = [] (v10 viser da
 * "Statistikk vises når du har logget runder."). ALDRI dummy/liksom-tall.
 */

import type {
  MetrikkCelle,
  StatistikkData,
} from "@/components/portal/statistikk/statistikk";
import { aggregateSg, formatSg } from "@/lib/sg";

/** Minimal runde-shape fra Prisma-loaderen (kun feltene aggregateSg trenger). */
export type RundeForStats = {
  score: number;
  sgTotal: number | null;
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
};

type SgMetrikk = {
  id: string;
  label: string;
  verdi: number | null;
};

/**
 * Bygger StatistikkData fra ekte runder. Tom-tilstand bevares når ingen
 * SG-metrikk har data.
 */
export function mapStatistikkData(runder: RundeForStats[]): StatistikkData {
  const aar = new Date().getFullYear();
  const agg = aggregateSg(runder);

  const sgMetrikker: SgMetrikk[] = [
    { id: "sg-total", label: "SG Total", verdi: agg.total },
    { id: "sg-ott", label: "SG Off-the-tee", verdi: agg.ott },
    { id: "sg-app", label: "SG Approach", verdi: agg.app },
    { id: "sg-arg", label: "SG Around-green", verdi: agg.arg },
    { id: "sg-putt", label: "SG Putting", verdi: agg.putt },
  ];

  const metrikker: MetrikkCelle[] = sgMetrikker.flatMap((m) => {
    if (m.verdi === null) return [];
    const formatted = formatSg(m.verdi);
    return [
      {
        id: m.id,
        label: m.label,
        value: formatted,
        unit: "/ runde",
        trend: {
          value: formatted,
          tone:
            m.verdi > 0 ? "positive" : m.verdi < 0 ? "negative" : "neutral",
        },
      } satisfies MetrikkCelle,
    ];
  });

  return {
    eyebrow: `STATS · ${aar} · ${runder.length} RUNDER`,
    aktivTab: "oversikt",
    metrikker,
    hrefs: {
      loggRunde: "/portal/analysere",
      metrikk: (id) => `/portal/statistikk/${id}`,
    },
  };
}
