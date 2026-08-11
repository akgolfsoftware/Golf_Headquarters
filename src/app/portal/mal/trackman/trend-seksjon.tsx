/**
 * TrackMan · Trend-seksjon — Paper-port W2 (fase2).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-trackman-liste.html —
 * ett kort med eyebrow «trend · køllehastighet siste N økter» og én enkel
 * sparkline (polyline i --fg). Punktene er snitt-køllehastighet per økt,
 * lest fra sesjonens lagrede sammendrag (rawJson.summary.avgClubSpeed) —
 * aldri fabrikkerte tall. Vises kun når minst 2 økter har målt verdi.
 */

import { Kort, Caps } from "@/components/v2";
import { T } from "@/lib/v2/tokens";

export type TrendPunkt = {
  recordedAt: Date;
  avgClubSpeed: number;
};

type RawSessionJson = {
  summary?: {
    avgClubSpeed?: number | null;
  };
};

/** Eldste → nyeste; kun økter med målt snitt-køllehastighet. Maks 8. */
export function byggTrendData(
  okter: Array<{ recordedAt: Date; rawJson: unknown }>,
): TrendPunkt[] {
  return [...okter]
    .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime())
    .flatMap((o) => {
      const raw = o.rawJson as RawSessionJson | null;
      const v = raw?.summary?.avgClubSpeed;
      return typeof v === "number" && Number.isFinite(v)
        ? [{ recordedAt: o.recordedAt, avgClubSpeed: v }]
        : [];
    })
    .slice(-8);
}

export function TrackManTrendSeksjon({ punkter }: { punkter: TrendPunkt[] }) {
  if (punkter.length < 2) return null;

  const W = 300;
  const H = 60;
  const pad = 6;
  const verdier = punkter.map((p) => p.avgClubSpeed);
  const min = Math.min(...verdier);
  const max = Math.max(...verdier);
  const range = max - min || 1;
  const pts = verdier
    .map((v, i) => {
      const x = (i / (verdier.length - 1)) * W;
      const y = pad + (H - pad * 2) - ((v - min) / range) * (H - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <Kort>
      <Caps style={{ display: "block", marginBottom: 8 }}>
        trend · køllehastighet siste {punkter.length} økter
      </Caps>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: 60, display: "block" }}
        role="img"
        aria-label={`Køllehastighet-trend over ${punkter.length} økter`}
      >
        <polyline
          points={pts}
          fill="none"
          stroke={T.fg}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Kort>
  );
}
