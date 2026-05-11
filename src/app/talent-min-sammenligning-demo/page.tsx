/**
 * PlayerHQ — Talent · Min sammenligning (Markus' egen syn)
 * Bygd fra spec talent-design/uploads/06-min-sammenligning.md
 * URL: /talent-min-sammenligning-demo
 *
 * Perspektiv: spillerens eget syn — jeg vs anonymisert peer + pro-rolemodel.
 * Ingen sidebar/rail. Norsk bokmål.
 */

import { ArrowLeft, Save } from "lucide-react";

type RadarSeries = {
  label: string;
  color: string;
  values: number[]; // 6 verdier 0–100 (Drive, Approach, Around, Putt, Course-mgmt, Mental)
};

type DiffRow = {
  label: string;
  detail: string;
  you: string;
  peer: string;
  delta: number; // positive = jeg leder
  deltaUnit?: string;
};

const RADAR_AXES = [
  "Drive",
  "Approach",
  "Around",
  "Putt",
  "Course-mgmt",
  "Mental",
];

const ME: RadarSeries = {
  label: "Jeg",
  color: "#005840",
  values: [86, 72, 68, 82, 74, 80],
};

const PEER: RadarSeries = {
  label: "Peer · anonymisert",
  color: "#5E7CB8",
  values: [78, 76, 65, 70, 72, 73],
};

const ROLE_MODEL: RadarSeries = {
  label: "Pro-mål · 17 år",
  color: "#B8852A",
  values: [88, 84, 80, 84, 86, 88],
};

const DIFF_ROWS: DiffRow[] = [
  {
    label: "Snitt-runde",
    detail: "siste 10 r.",
    you: "71,4",
    peer: "73,3",
    delta: 1.9,
    deltaUnit: "slag bedre",
  },
  {
    label: "Percentil",
    detail: "J19-kohort",
    you: "82.",
    peer: "74.",
    delta: 8,
    deltaUnit: "perc.",
  },
  {
    label: "Talent-score",
    detail: "0–100",
    you: "71,4",
    peer: "64,8",
    delta: 6.6,
  },
  {
    label: "SG total",
    detail: "vs scratch",
    you: "+0,32",
    peer: "−0,10",
    delta: 0.42,
  },
  {
    label: "SG approach",
    detail: "100–125 m",
    you: "−0,18",
    peer: "+0,04",
    delta: -0.22,
  },
  {
    label: "Improvement",
    detail: "siste 12 mnd",
    you: "−1,4 HCP",
    peer: "−0,8 HCP",
    delta: 0.6,
    deltaUnit: "raskere",
  },
];

// Trajectory: HCP fra 12 år til 20 år for 3 spillere
const TRAJECTORY_YEARS = [12, 13, 14, 15, 16, 17, 18, 19, 20];

const TRAJECTORY: {
  label: string;
  color: string;
  values: (number | null)[];
  dashed?: boolean;
  cutoffAge?: number;
}[] = [
  {
    label: "Pro-rolemodel · 17 år",
    color: "#B8852A",
    values: [14.5, 11.0, 8.0, 4.5, 1.0, -2.0, -4.5, -6.0, -7.0],
    dashed: true,
  },
  {
    label: "Peer · anonymisert",
    color: "#5E7CB8",
    values: [16.0, 13.0, 10.0, 7.5, 5.0, 3.0, null, null, null],
    cutoffAge: 17,
  },
  {
    label: "Jeg",
    color: "#005840",
    values: [15.5, 12.5, 9.0, 6.0, 3.0, 0.5, null, null, null],
    cutoffAge: 17,
  },
];

export default function TalentMinSammenligningDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1200px] px-8 py-8">
        {/* PageHeader */}
        <header className="mb-5 flex items-start justify-between gap-6">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Sammenligning
            </span>
            <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
              <em className="italic text-primary">Hvordan står</em> jeg mot …
            </h1>
            <p className="mt-1.5 max-w-[560px] text-[13px] leading-[1.5] text-muted-foreground">
              Min profil målt mot en anonymisert jevnaldrende i samme kohort og en
              pro-rolemodel ved samme alder. Alle tall er hentet fra GolfBox og Trackman
              uke 17–19, 2026.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium hover:bg-secondary">
              <ArrowLeft size={14} strokeWidth={1.5} />
              Tilbake
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90">
              <Save size={14} strokeWidth={1.5} />
              Lagre
            </button>
          </div>
        </header>

        {/* FilterRow */}
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Sammenligner
          </span>
          <Chip color="primary">Jeg</Chip>
          <Chip color="info">Peer · anonymisert</Chip>
          <Chip color="warning">Pro-rolemodel · 17 år</Chip>
          <span className="ml-auto font-mono text-[11px] text-muted-foreground">
            kohort: J19 norske gutter · n = 412 · 11.05.2026
          </span>
        </div>

        {/* 3-kolonne grid: Meg / Diff / Peer */}
        <div className="mb-6 grid grid-cols-[1fr_1fr_1fr] gap-4">
          <PlayerCard
            badge="Jeg"
            badgeTone="primary"
            initials="M"
            name="Min profil"
            sub="J19 · norsk · GFGK · WANG"
            radar={ME}
            stats={[
              { label: "Snitt-runde", value: "71,4" },
              { label: "Percentil", value: "82." },
              { label: "SG total", value: "+0,32" },
            ]}
          />

          {/* DiffCard i midten */}
          <section className="rounded-lg border border-border bg-[var(--surface-alt,#F1EEE5)] p-5">
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Differanse
            </div>
            <h3 className="mt-2 font-display text-[24px] font-medium leading-snug">
              <em className="italic">jeg</em> vs <em className="italic">peer</em>
            </h3>

            <div className="mt-4 flex flex-col">
              {DIFF_ROWS.map((row, i) => (
                <DiffRowView
                  key={row.label}
                  row={row}
                  last={i === DIFF_ROWS.length - 1}
                />
              ))}
            </div>

            <div className="mt-5 rounded-md bg-card p-4 text-[12px] leading-[1.55]">
              <p>
                Jeg leder peer på alt unntatt <b className="font-semibold">approach</b>.
                Pro-rolemodellen ved samme alder var <b className="font-semibold">2 slag bedre</b>{" "}
                i snitt-runde, men jeg er <b className="font-semibold">+0,3 SG sterkere på putt</b>{" "}
                enn han var som 17-åring.
              </p>
            </div>
          </section>

          <PlayerCard
            badge="Peer"
            badgeTone="info"
            initials="?"
            name="Anonymisert jevnaldrende"
            sub="J19 · samme percentil-band · 10 cm høyere"
            radar={PEER}
            stats={[
              { label: "Snitt-runde", value: "73,3" },
              { label: "Percentil", value: "74." },
              { label: "SG total", value: "−0,10" },
            ]}
          />
        </div>

        {/* Trajectory-overlay */}
        <section className="mb-6 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Trajectory-overlay · HCP per alder
              </div>
              <h3 className="mt-1.5 font-display text-[20px] font-medium leading-snug">
                Min kurve mot pro-rolemodellens
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 font-mono text-[10px]">
              <Legend color="#005840" label="Jeg" />
              <Legend color="#5E7CB8" label="Peer (anon.)" />
              <Legend color="#B8852A" label="Pro-rolemodel" dashed />
            </div>
          </div>

          <TrajectoryChart />

          <p className="mt-4 text-[12px] leading-[1.55] text-muted-foreground">
            Pro-rolemodellens kurve <b className="font-semibold text-foreground">aksellererte ved 17 år</b>{" "}
            da han debuterte på Korn Ferry-tour-eventer. Jeg følger en lignende kurve,
            men med <em className="italic text-foreground">0,5 slag/år raskere</em>{" "}
            forbedring enn han på samme alder.
          </p>
        </section>

        {/* Trend-strip + percentil-fordeling */}
        <section className="grid grid-cols-3 gap-4">
          <TrendStat
            label="Bedre enn snitt"
            value="82 %"
            sub="av J19-kohorten"
            tone="success"
          />
          <TrendStat
            label="Bak pro-mål"
            value="−4,8"
            sub="poeng talent-score til 84"
            tone="warning"
          />
          <TrendStat
            label="Trend 90 d"
            value="+3,2"
            sub="talent-score · stigende"
            tone="success"
          />
        </section>
      </div>
    </div>
  );
}

function Chip({
  color,
  children,
}: {
  color: "primary" | "info" | "warning";
  children: React.ReactNode;
}) {
  const styles =
    color === "primary"
      ? "bg-primary text-primary-foreground"
      : color === "info"
        ? "bg-[#5E7CB8] text-white"
        : "bg-[#B8852A] text-white";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium ${styles}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white" />
      {children}
    </span>
  );
}

function PlayerCard({
  badge,
  badgeTone,
  initials,
  name,
  sub,
  radar,
  stats,
}: {
  badge: string;
  badgeTone: "primary" | "info";
  initials: string;
  name: string;
  sub: string;
  radar: RadarSeries;
  stats: { label: string; value: string }[];
}) {
  const avatarBg =
    badgeTone === "primary"
      ? "bg-primary text-primary-foreground"
      : "bg-secondary text-foreground";
  const badgeBg =
    badgeTone === "primary"
      ? "bg-accent text-accent-foreground"
      : "bg-[#5E7CB8] text-white";
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <div
          className={`grid h-14 w-14 shrink-0 place-items-center rounded-full font-display text-[20px] font-semibold ${avatarBg}`}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <span
            className={`inline-flex rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] ${badgeBg}`}
          >
            {badge}
          </span>
          <div className="mt-1.5 text-[14px] font-semibold leading-tight">
            {name}
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
            {sub}
          </div>
        </div>
      </div>

      <RadarSG series={radar} />

      <div className="grid grid-cols-3 gap-2 border-t border-border pt-3">
        {stats.map((s) => (
          <div key={s.label}>
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              {s.label}
            </div>
            <div className="mt-1 font-mono text-[16px] font-medium tabular-nums leading-none">
              {s.value}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RadarSG({ series }: { series: RadarSeries }) {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 88;
  const axes = RADAR_AXES.length;

  // Compute polygon points
  const points = series.values
    .map((v, i) => {
      const angle = (i / axes) * Math.PI * 2 - Math.PI / 2;
      const r = (v / 100) * radius;
      return `${(cx + Math.cos(angle) * r).toFixed(1)},${(cy + Math.sin(angle) * r).toFixed(1)}`;
    })
    .join(" ");

  return (
    <div className="rounded-md bg-[var(--surface-alt,#F1EEE5)] p-2">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="block h-[200px] w-full overflow-visible"
      >
        {/* concentric grid */}
        {[0.25, 0.5, 0.75, 1].map((ratio) => {
          const r = radius * ratio;
          const ringPts = Array.from({ length: axes }, (_, i) => {
            const a = (i / axes) * Math.PI * 2 - Math.PI / 2;
            return `${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`;
          }).join(" ");
          return (
            <polygon
              key={ratio}
              points={ringPts}
              fill="none"
              stroke="#C4C0B8"
              strokeWidth="0.6"
              opacity={0.5}
            />
          );
        })}

        {/* axes */}
        {RADAR_AXES.map((label, i) => {
          const a = (i / axes) * Math.PI * 2 - Math.PI / 2;
          const x = cx + Math.cos(a) * radius;
          const y = cy + Math.sin(a) * radius;
          const tx = cx + Math.cos(a) * (radius + 14);
          const ty = cy + Math.sin(a) * (radius + 14);
          return (
            <g key={label}>
              <line
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke="#C4C0B8"
                strokeWidth="0.6"
                opacity={0.4}
              />
              <text
                x={tx}
                y={ty}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground font-mono text-[8px]"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* pro-mål overlay (dashed, light) */}
        <polygon
          points={ROLE_MODEL.values
            .map((v, i) => {
              const angle = (i / axes) * Math.PI * 2 - Math.PI / 2;
              const r = (v / 100) * radius;
              return `${(cx + Math.cos(angle) * r).toFixed(1)},${(cy + Math.sin(angle) * r).toFixed(1)}`;
            })
            .join(" ")}
          fill="none"
          stroke="#B8852A"
          strokeWidth="1.2"
          strokeDasharray="3 3"
          opacity={0.8}
        />

        {/* player polygon */}
        <polygon
          points={points}
          fill={`${series.color}30`}
          stroke={series.color}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {series.values.map((v, i) => {
          const angle = (i / axes) * Math.PI * 2 - Math.PI / 2;
          const r = (v / 100) * radius;
          return (
            <circle
              key={i}
              cx={cx + Math.cos(angle) * r}
              cy={cy + Math.sin(angle) * r}
              r="3"
              fill="#FFFFFF"
              stroke={series.color}
              strokeWidth="1.5"
            />
          );
        })}
      </svg>
    </div>
  );
}

function DiffRowView({ row, last }: { row: DiffRow; last: boolean }) {
  const positive = row.delta > 0;
  const tone = positive ? "text-[#1A7D56]" : "text-[#A32D2D]";
  const arrow = positive ? "↑" : "↓";
  const formatted =
    typeof row.delta === "number"
      ? `${arrow} ${Math.abs(row.delta).toString().replace(".", ",")}`
      : "";
  return (
    <div
      className={`grid grid-cols-[1fr_60px_60px_auto] items-center gap-2 py-2.5 ${
        last ? "" : "border-b border-border"
      }`}
    >
      <div>
        <div className="text-[12px] font-semibold leading-tight">{row.label}</div>
        <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
          {row.detail}
        </div>
      </div>
      <span className="text-right font-mono text-[13px] font-semibold tabular-nums">
        {row.you}
      </span>
      <span className="text-right font-mono text-[13px] tabular-nums text-muted-foreground">
        {row.peer}
      </span>
      <span
        className={`inline-flex min-w-[88px] justify-end font-mono text-[11px] font-semibold ${tone}`}
      >
        {formatted}
        {row.deltaUnit && (
          <small className="ml-1 font-normal text-[10px] text-muted-foreground">
            {row.deltaUnit}
          </small>
        )}
      </span>
    </div>
  );
}

function Legend({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span
        className="inline-block h-0.5 w-5"
        style={{
          background: dashed
            ? `repeating-linear-gradient(90deg, ${color} 0 4px, transparent 4px 7px)`
            : color,
        }}
      />
      {label}
    </span>
  );
}

function TrajectoryChart() {
  const W = 720;
  const H = 220;
  const padL = 36;
  const padR = 16;
  const padT = 16;
  const padB = 32;

  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const minY = -8;
  const maxY = 18;
  const years = TRAJECTORY_YEARS;

  const xFor = (year: number) =>
    padL + ((year - years[0]) / (years[years.length - 1] - years[0])) * innerW;
  const yFor = (hcp: number) =>
    padT + ((maxY - hcp) / (maxY - minY)) * innerH;

  return (
    <div className="rounded-md bg-[var(--surface-alt,#F1EEE5)] p-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="block h-[240px] w-full overflow-visible"
      >
        {/* Grid */}
        {[18, 12, 6, 0, -6].map((v) => (
          <g key={v}>
            <line
              x1={padL}
              y1={yFor(v)}
              x2={W - padR}
              y2={yFor(v)}
              stroke="#E5E3DD"
              strokeWidth="0.8"
            />
            <text
              x={padL - 6}
              y={yFor(v) + 3}
              textAnchor="end"
              className="fill-muted-foreground font-mono text-[9px]"
            >
              {v > 0 ? `+${v}` : v}
            </text>
          </g>
        ))}

        {/* X-akse labels */}
        {years.map((y) => (
          <text
            key={y}
            x={xFor(y)}
            y={H - padB + 16}
            textAnchor="middle"
            className="fill-muted-foreground font-mono text-[9px]"
          >
            {y} år
          </text>
        ))}

        {/* "Nå"-markør på 17 år */}
        <line
          x1={xFor(17)}
          y1={padT}
          x2={xFor(17)}
          y2={H - padB}
          stroke="#005840"
          strokeWidth="1.2"
          strokeDasharray="4 3"
          opacity={0.6}
        />
        <text
          x={xFor(17) + 4}
          y={padT + 10}
          className="fill-primary font-mono text-[9px] font-semibold"
        >
          Nå · 17 år
        </text>

        {/* Series */}
        {TRAJECTORY.map((s) => {
          const pts = s.values
            .map((v, i) => (v === null ? null : `${xFor(years[i])},${yFor(v)}`))
            .filter((p): p is string => p !== null)
            .join(" L");
          if (!pts) return null;
          return (
            <g key={s.label}>
              <path
                d={`M${pts}`}
                fill="none"
                stroke={s.color}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={s.dashed ? "5 4" : undefined}
              />
              {/* End marker */}
              {(() => {
                const lastIdx = s.cutoffAge
                  ? years.indexOf(s.cutoffAge)
                  : s.values.length - 1;
                const v = s.values[lastIdx];
                if (v === null) return null;
                return (
                  <circle
                    cx={xFor(years[lastIdx])}
                    cy={yFor(v)}
                    r="4.5"
                    fill="#FFFFFF"
                    stroke={s.color}
                    strokeWidth="2"
                  />
                );
              })()}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function TrendStat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "success" | "warning";
}) {
  const valueTone =
    tone === "success" ? "text-[#1A7D56]" : "text-[#B8852A]";
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-2.5 font-display text-[32px] font-medium leading-none tabular-nums ${valueTone}`}
      >
        {value}
      </div>
      <div className="mt-2 font-mono text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}
