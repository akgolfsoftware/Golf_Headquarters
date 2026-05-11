/**
 * DEMO — Talent · Kohort-explorer
 * Spec: docs/spec/talent/10-kohort-explorer.md
 * URL: /talent-kohort-demo
 *
 * Stort kohort-scatter for scout-deepdive. Norske amatører som
 * funksjon av alder × score, med fleksibel color-by.
 */

import { Search, Layers } from "lucide-react";

type ColorBy = "score" | "region" | "klasse" | "kjonn" | "improvement";

type Dot = {
  id: string;
  age: number;
  score: number;
  size: number;
  score10: number; // 0..100 talent-score for color-by
  region: "Øst" | "Vest" | "Sør" | "Nord" | "Midt";
  klasse: "J19/G19" | "J15/G15" | "J10–13";
  kjonn: "G" | "J";
  improvement: number; // delta percentile
  highlight?: { name: string; selected?: boolean };
};

// 118 dots — 8 navngitte + 110 generated deterministisk
const NAMED_DOTS: Dot[] = [
  { id: "n1", age: 17, score: 68.4, size: 12, score10: 92, region: "Øst", klasse: "J19/G19", kjonn: "G", improvement: 88, highlight: { name: "Markus R.", selected: true } },
  { id: "n2", age: 16, score: 70.2, size: 10, score10: 86, region: "Øst", klasse: "J19/G19", kjonn: "G", improvement: 74, highlight: { name: "Anders N." } },
  { id: "n3", age: 15, score: 72.6, size: 10, score10: 78, region: "Øst", klasse: "J15/G15", kjonn: "G", improvement: 70, highlight: { name: "Joachim V." } },
  { id: "n4", age: 18, score: 67.2, size: 11, score10: 87, region: "Øst", klasse: "J19/G19", kjonn: "G", improvement: 82, highlight: { name: "Eirik L." } },
  { id: "n5", age: 14, score: 75.0, size: 9, score10: 72, region: "Vest", klasse: "J15/G15", kjonn: "J", improvement: 76, highlight: { name: "Sofie L." } },
  { id: "n6", age: 16, score: 71.4, size: 9, score10: 80, region: "Vest", klasse: "J19/G19", kjonn: "J", improvement: 68, highlight: { name: "Ida S." } },
  { id: "n7", age: 13, score: 78.2, size: 8, score10: 64, region: "Øst", klasse: "J10–13", kjonn: "G", improvement: 90, highlight: { name: "Henrik L." } },
  { id: "n8", age: 14, score: 74.0, size: 9, score10: 75, region: "Sør", klasse: "J15/G15", kjonn: "G", improvement: 85, highlight: { name: "Oskar V." } },
];

function generateDots(): Dot[] {
  const out: Dot[] = [...NAMED_DOTS];
  const regions: Dot["region"][] = ["Øst", "Vest", "Sør", "Nord", "Midt"];
  let seed = 17;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 2 ** 32;
    return (seed >>> 0) / 2 ** 32;
  };
  for (let i = 0; i < 110; i++) {
    const age = 10 + Math.floor(rand() * 11); // 10..20
    const ideal = 92 - (age - 10) * 1.8;
    const score = ideal + (rand() - 0.5) * 9;
    const region = regions[Math.floor(rand() * regions.length)]!;
    const klasse: Dot["klasse"] = age >= 16 ? "J19/G19" : age >= 14 ? "J15/G15" : "J10–13";
    const kjonn: Dot["kjonn"] = rand() > 0.45 ? "G" : "J";
    out.push({
      id: `d${i}`,
      age,
      score: Math.round(score * 10) / 10,
      size: 5 + Math.floor(rand() * 4),
      score10: Math.floor(rand() * 90) + 5,
      region,
      klasse,
      kjonn,
      improvement: Math.floor(rand() * 100),
    });
  }
  return out;
}

const DOTS = generateDots();

const FILTERS_1 = ["Begge kjønn", "Gutter", "Jenter", "Alle klasser", "J19/G19", "J15/G15", "J10–13", "Kun NCAA-aktuelle"];
const FILTERS_2: { key: ColorBy; label: string }[] = [
  { key: "score", label: "Talent-score" },
  { key: "region", label: "Region" },
  { key: "klasse", label: "Klasse" },
  { key: "kjonn", label: "Kjønn" },
  { key: "improvement", label: "Improvement" },
];

const ACTIVE_COLOR_BY: ColorBy = "score";

export default function TalentKohortDemo() {
  return (
    <div className="min-h-screen bg-[var(--color-card,#FFFFFF)] text-foreground">
      {/* Header */}
      <header className="grid grid-cols-[1fr_auto] items-end gap-6 border-b border-border pb-5 pt-1 mb-5">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Scout · Kohort-explorer
          </span>
          <h1 className="mt-1 font-display text-[36px] font-bold leading-[1.1] tracking-tight">
            <em className="font-medium italic">Norsk</em> amatørpool
          </h1>
          <p className="mt-1.5 max-w-[520px] text-[13px] leading-[1.5] text-muted-foreground">
            Alder × score for hele kullet. Color-by, p25/p50/p75-bånd, klikkbare
            navngitte talenter.
          </p>
        </div>
        <div className="relative w-[360px]">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <input
            type="search"
            placeholder="Søk i 487 spillere…"
            className="w-full rounded-md border border-input bg-card pl-9 pr-3 py-2.5 text-[13px] placeholder:text-muted-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/30"
          />
        </div>
      </header>

      {/* Action-strip */}
      <div className="mb-5 flex flex-wrap items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5">
        <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          I visning
        </span>
        <ActionItem tone="info">
          <b>{DOTS.length}</b> spillere
        </ActionItem>
        <ActionItem tone="success">
          <b>12</b> over p90
        </ActionItem>
        <ActionItem>
          gjennomsnitt-percentil <b>P57</b>
        </ActionItem>
        <button className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
          <Layers className="h-4 w-4" strokeWidth={1.5} />
          Lasso-velg gruppe
        </button>
      </div>

      {/* Filter row 1: kjønn + klasse + ncaa */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {FILTERS_1.map((f, i) => (
          <button
            key={f}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
              i === 0 || i === 3
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-foreground hover:bg-secondary"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Filter row 2: color-by */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Color-by
        </span>
        {FILTERS_2.map((f) => (
          <button
            key={f.key}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-colors ${
              f.key === ACTIVE_COLOR_BY
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-foreground hover:bg-secondary"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          cohort p25/p50/p75-bånd vises
        </span>
      </div>

      {/* Scatter card */}
      <section className="rounded-lg border border-border bg-card p-6">
        <CohortScatter />
        {/* Footer-totals */}
        <div className="mt-5 grid grid-cols-5 gap-3 border-t border-[var(--line-soft,#EFEDE6)] pt-4">
          <FooterStat label="Totalt" value="118" sub="spillere" />
          <FooterStat label="Topp 10 %" value="12" sub="over p90" />
          <FooterStat label="Median alder" value="16,2" sub="år" />
          <FooterStat label="Median score" value="76,2" sub="brutto" />
          <FooterStat label="Top-talent" value="87" sub="Eirik L." />
        </div>
      </section>
    </div>
  );
}

function CohortScatter() {
  const width = 1080;
  const height = 520;
  const padL = 56;
  const padR = 24;
  const padT = 24;
  const padB = 44;
  const xMin = 9.5;
  const xMax = 20.5;
  const yMin = 60;
  const yMax = 96;
  const xScale = (a: number) => padL + ((a - xMin) / (xMax - xMin)) * (width - padL - padR);
  const yScale = (s: number) => padT + ((yMax - s) / (yMax - yMin)) * (height - padT - padB);

  // p50 / p90 bands as curves (lower scores = better)
  const ages = Array.from({ length: 12 }, (_, i) => 10 + i);
  const p50Path = ages.map((a, i) => `${i === 0 ? "M" : "L"} ${xScale(a)} ${yScale(92 - (a - 10) * 1.6)}`).join(" ");
  const p90Path = ages.map((a, i) => `${i === 0 ? "M" : "L"} ${xScale(a)} ${yScale(88 - (a - 10) * 1.7)}`).join(" ");

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
        {/* X gridlines */}
        {ages.map((a) => (
          <line
            key={`gx${a}`}
            x1={xScale(a)}
            x2={xScale(a)}
            y1={padT}
            y2={height - padB}
            stroke="var(--line-soft, #EFEDE6)"
            strokeWidth={1}
          />
        ))}
        {/* Y gridlines */}
        {[64, 70, 76, 82, 88, 94].map((s) => (
          <g key={`gy${s}`}>
            <line
              x1={padL}
              x2={width - padR}
              y1={yScale(s)}
              y2={yScale(s)}
              stroke="var(--line-soft, #EFEDE6)"
              strokeWidth={1}
            />
            <text
              x={padL - 10}
              y={yScale(s) + 4}
              textAnchor="end"
              fontFamily="var(--font-geist-mono)"
              fontSize="10"
              fill="var(--color-muted-foreground, #5E5C57)"
            >
              {s}
            </text>
          </g>
        ))}
        {/* X labels */}
        {ages.map((a) => (
          <text
            key={`xl${a}`}
            x={xScale(a)}
            y={height - padB + 18}
            textAnchor="middle"
            fontFamily="var(--font-geist-mono)"
            fontSize="10"
            fill="var(--color-muted-foreground, #5E5C57)"
          >
            {a}
          </text>
        ))}

        {/* Bånd */}
        <path
          d={p50Path}
          fill="none"
          stroke="var(--color-pyr-fys, #005840)"
          strokeWidth={1.25}
          strokeDasharray="4 4"
          opacity={0.6}
        />
        <path
          d={p90Path}
          fill="none"
          stroke="var(--color-pyr-slag, #D1F843)"
          strokeWidth={1.5}
          strokeDasharray="2 4"
          opacity={0.85}
        />

        {/* Båndlabels */}
        <text
          x={width - padR - 6}
          y={yScale(92 - 10 * 1.6) - 4}
          textAnchor="end"
          fontFamily="var(--font-geist-mono)"
          fontSize="10"
          fill="var(--color-pyr-fys, #005840)"
        >
          p50
        </text>
        <text
          x={width - padR - 6}
          y={yScale(88 - 10 * 1.7) - 4}
          textAnchor="end"
          fontFamily="var(--font-geist-mono)"
          fontSize="10"
          fill="#0A1F17"
        >
          p90
        </text>

        {/* Akse-titler */}
        <text
          x={width / 2}
          y={height - 6}
          textAnchor="middle"
          fontFamily="var(--font-geist-mono)"
          fontSize="10"
          fill="var(--color-muted-foreground, #5E5C57)"
        >
          ALDER (ÅR)
        </text>
        <text
          x={14}
          y={height / 2}
          transform={`rotate(-90 14 ${height / 2})`}
          textAnchor="middle"
          fontFamily="var(--font-geist-mono)"
          fontSize="10"
          fill="var(--color-muted-foreground, #5E5C57)"
        >
          BRUTTO SCORE (LAVERE = BEDRE)
        </text>

        {/* Dots */}
        {DOTS.map((d) => {
          const cx = xScale(d.age);
          const cy = yScale(d.score);
          const fill = colorFor(d, ACTIVE_COLOR_BY);
          const isHighlight = !!d.highlight;
          const selected = d.highlight?.selected;
          return (
            <g key={d.id}>
              {selected && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={d.size + 5}
                  fill="none"
                  stroke="var(--color-pyr-slag, #D1F843)"
                  strokeWidth={2.5}
                />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={d.size}
                fill={fill}
                stroke={isHighlight ? "var(--color-foreground, #0A1F17)" : "rgba(255,255,255,0.6)"}
                strokeWidth={isHighlight ? 1.25 : 0.75}
                opacity={isHighlight ? 1 : 0.78}
              />
              {isHighlight && d.highlight && (
                <text
                  x={cx + d.size + 5}
                  y={cy + 3}
                  fontFamily="var(--font-geist)"
                  fontSize="10.5"
                  fontWeight={600}
                  fill="var(--color-foreground, #0A1F17)"
                >
                  {d.highlight.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function colorFor(d: Dot, mode: ColorBy): string {
  if (mode === "score") {
    if (d.score10 >= 85) return "var(--color-pyr-fys, #005840)";
    if (d.score10 >= 70) return "#1A7D56";
    if (d.score10 >= 50) return "var(--color-pyr-slag, #D1F843)";
    if (d.score10 >= 30) return "var(--color-pyr-spill, #B8852A)";
    return "var(--color-pyr-turn, #5E5C57)";
  }
  if (mode === "region") {
    return {
      Øst: "var(--color-pyr-fys, #005840)",
      Vest: "#1A7D56",
      Sør: "var(--color-pyr-slag, #D1F843)",
      Nord: "var(--color-pyr-spill, #B8852A)",
      Midt: "var(--color-pyr-turn, #5E5C57)",
    }[d.region];
  }
  if (mode === "klasse") {
    return {
      "J19/G19": "var(--color-pyr-fys, #005840)",
      "J15/G15": "var(--color-pyr-slag, #D1F843)",
      "J10–13": "var(--color-pyr-spill, #B8852A)",
    }[d.klasse];
  }
  if (mode === "kjonn") {
    return d.kjonn === "G" ? "var(--color-pyr-fys, #005840)" : "var(--color-pyr-spill, #B8852A)";
  }
  // improvement
  if (d.improvement >= 80) return "var(--color-pyr-fys, #005840)";
  if (d.improvement >= 60) return "#1A7D56";
  if (d.improvement >= 40) return "var(--color-pyr-slag, #D1F843)";
  return "var(--color-pyr-turn, #5E5C57)";
}

function FooterStat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div>
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 font-mono text-[22px] font-medium tabular-nums leading-none">
        {value}
      </div>
      <div className="mt-1.5 text-[11px] leading-tight text-muted-foreground">{sub}</div>
    </div>
  );
}

function ActionItem({
  tone,
  children,
}: {
  tone?: "info" | "warn" | "success";
  children: React.ReactNode;
}) {
  const bg =
    tone === "info"
      ? "bg-primary/8 text-primary"
      : tone === "warn"
        ? "bg-[#FFF0D6] text-[#B8852A]"
        : tone === "success"
          ? "bg-[#E5F1EA] text-[#1A7D56]"
          : "bg-secondary text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[12px] font-medium ${bg}`}
    >
      {children}
    </span>
  );
}
