// SG-Spider chart (server-rendert SVG).
// 4 akser: OTT, APP, ARG, PUTT. Skala: -2 til +2 SG.

import type { SgAggregate } from "@/lib/sg";

const STORRELSE = 240;
const SENTRUM = STORRELSE / 2;
const RADIUS = 90;
const AKSER = [
  { key: "ott", label: "OTT", angle: -90 },
  { key: "app", label: "APP", angle: 0 },
  { key: "arg", label: "ARG", angle: 90 },
  { key: "putt", label: "PUTT", angle: 180 },
] as const;

const SG_MIN = -2;
const SG_MAX = 2;

function tilPunkt(angle: number, distanse: number) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: SENTRUM + Math.cos(rad) * distanse,
    y: SENTRUM + Math.sin(rad) * distanse,
  };
}

function sgTilDistanse(sg: number | null): number {
  if (sg == null) return 0;
  const klemt = Math.max(SG_MIN, Math.min(SG_MAX, sg));
  return ((klemt - SG_MIN) / (SG_MAX - SG_MIN)) * RADIUS;
}

export function SgSpider({ data }: { data: SgAggregate }) {
  const punkter = AKSER.map((akse) =>
    tilPunkt(akse.angle, sgTilDistanse(data[akse.key]))
  );
  const polygonPunkter = punkter.map((p) => `${p.x},${p.y}`).join(" ");

  // Bakgrunns-ringer ved -1, 0, +1, +2 SG
  const ringDistanser = [-1, 0, 1, 2].map((sg) => sgTilDistanse(sg));

  return (
    <svg
      viewBox={`0 0 ${STORRELSE} ${STORRELSE}`}
      className="h-full w-full"
      role="img"
      aria-label="SG-fordeling"
    >
      {/* Bakgrunns-ringer */}
      {ringDistanser.map((d, i) => (
        <circle
          key={i}
          cx={SENTRUM}
          cy={SENTRUM}
          r={d}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={1}
          strokeDasharray={d === sgTilDistanse(0) ? "none" : "2 4"}
        />
      ))}

      {/* Akse-linjer */}
      {AKSER.map((akse) => {
        const ytre = tilPunkt(akse.angle, RADIUS);
        return (
          <line
            key={akse.key}
            x1={SENTRUM}
            y1={SENTRUM}
            x2={ytre.x}
            y2={ytre.y}
            stroke="hsl(var(--border))"
            strokeWidth={1}
          />
        );
      })}

      {/* Data-polygon */}
      <polygon
        points={polygonPunkter}
        fill="hsl(var(--primary) / 0.15)"
        stroke="hsl(var(--primary))"
        strokeWidth={2}
      />

      {/* Data-punkter */}
      {punkter.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r={3}
          fill="hsl(var(--primary))"
        />
      ))}

      {/* Akse-labels */}
      {AKSER.map((akse) => {
        const labelDist = RADIUS + 18;
        const p = tilPunkt(akse.angle, labelDist);
        return (
          <text
            key={akse.key}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground font-mono text-[10px] uppercase tracking-[0.10em]"
          >
            {akse.label}
          </text>
        );
      })}
    </svg>
  );
}
