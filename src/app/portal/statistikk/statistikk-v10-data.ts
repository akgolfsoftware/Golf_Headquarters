/**
 * Mapper: ekte Prisma-runder → v10 StatistikkData (komponent-props).
 *
 * Oversetter spillerens loggede runder til SG-metrikk-celler. Følger samme
 * mønster som mapHjemData i /portal/page.tsx: ren oversettelse av loader-shape
 * til komponentens prop-shape, med BEVART tom-tilstand.
 *
 * Tom-tilstand: når ingen runder har SG-data ⇒ metrikker = [] (v10 viser da
 * "Statistikk vises når du har logget runder."). ALDRI dummy/liksom-tall.
 */

import type {
  MetrikkCelle,
  StatistikkData,
} from "@/components/portal/statistikk/statistikk";

/** Minimal runde-shape fra Prisma-loaderen (kun feltene mapperen trenger). */
export type RundeForStats = {
  sgTotal: number | null;
  sgOtt: number | null;
  sgApp: number | null;
  sgArg: number | null;
  sgPutt: number | null;
};

type SgFelt = "sgTotal" | "sgOtt" | "sgApp" | "sgArg" | "sgPutt";

const SG_METRIKKER: { id: string; label: string; felt: SgFelt }[] = [
  { id: "sg-total", label: "SG Total", felt: "sgTotal" },
  { id: "sg-ott", label: "SG Off-the-tee", felt: "sgOtt" },
  { id: "sg-app", label: "SG Approach", felt: "sgApp" },
  { id: "sg-arg", label: "SG Around-green", felt: "sgArg" },
  { id: "sg-putt", label: "SG Putting", felt: "sgPutt" },
];

/** Norsk desimalformat med fortegn, f.eks. 0,42 / −0,18. */
function formatSg(verdi: number): string {
  const fast = Math.abs(verdi).toFixed(2).replace(".", ",");
  if (verdi > 0) return `+${fast}`;
  if (verdi < 0) return `−${fast}`; // ekte minus-tegn
  return fast;
}

/** Snitt av et SG-felt over runder som har verdi. null hvis ingen. */
function snitt(runder: RundeForStats[], felt: SgFelt): number | null {
  const verdier = runder
    .map((r) => r[felt])
    .filter((v): v is number => typeof v === "number");
  if (verdier.length === 0) return null;
  return verdier.reduce((s, v) => s + v, 0) / verdier.length;
}

/**
 * Bygger StatistikkData fra ekte runder. Tom-tilstand bevares når ingen
 * SG-metrikk har data.
 */
export function mapStatistikkData(runder: RundeForStats[]): StatistikkData {
  const aar = new Date().getFullYear();

  const metrikker: MetrikkCelle[] = SG_METRIKKER.flatMap((m) => {
    const verdi = snitt(runder, m.felt);
    if (verdi === null) return [];
    return [
      {
        id: m.id,
        label: m.label,
        value: formatSg(verdi),
        unit: "/ runde",
        trend: {
          value: formatSg(verdi),
          tone:
            verdi > 0 ? "positive" : verdi < 0 ? "negative" : "neutral",
        },
      } satisfies MetrikkCelle,
    ];
  });

  return {
    eyebrow: `STATS · ${aar} · ${runder.length} RUNDER`,
    aktivTab: "oversikt",
    metrikker,
    hrefs: {
      loggRunde: "/portal/mal/runder/ny",
      metrikk: (id) => `/portal/statistikk/${id}`,
    },
  };
}
