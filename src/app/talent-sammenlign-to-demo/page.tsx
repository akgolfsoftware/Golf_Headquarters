/**
 * DEMO — CoachHQ Talent · Sammenlign to spillere
 * Spec: _extracted/talent-design/uploads/12-sammenlign-to.md
 * URL: /talent-sammenlign-to-demo
 *
 * Default state: lyst tema, ingen sidebar/shell. Server component.
 */

import {
  ChevronLeft,
  Download,
  Search,
  Plus,
  ArrowRight,
} from "lucide-react";

type PlayerData = {
  initials: string;
  name: string;
  club: string;
  age: number;
  hcp: string;
  formPill: { tone: "success" | "danger" | "info"; text: string };
  talentPill: { tone: "info" | "muted" | "warning"; text: string };
  avatar: "primary" | "info";
  sg: number[]; // 5 verdier 0–1
  stats: Array<{ label: string; value: string }>;
};

const MARKUS: PlayerData = {
  initials: "MP",
  name: "Markus Roinås Pedersen",
  club: "WANG Toppidrett",
  age: 16,
  hcp: "+2,4",
  formPill: { tone: "success", text: "↑ Form +8 %" },
  talentPill: { tone: "info", text: "Talent 94" },
  avatar: "primary",
  sg: [0.92, 0.66, 0.74, 0.82, 0.79],
  stats: [
    { label: "Avg runde", value: "70,1" },
    { label: "Percentil", value: "94" },
    { label: "SG total", value: "+1,24" },
    { label: "Improvement", value: "1,8 slag/år" },
    { label: "Climber-rank", value: "3 / 118" },
    { label: "Total starts", value: "28" },
  ],
};

const ANDERS: PlayerData = {
  initials: "AN",
  name: "Anders Nedrum",
  club: "GFGK",
  age: 17,
  hcp: "5,2",
  formPill: { tone: "info", text: "→ Stabil" },
  talentPill: { tone: "muted", text: "Talent 74" },
  avatar: "info",
  sg: [0.68, 0.48, 0.62, 0.74, 0.70],
  stats: [
    { label: "Avg runde", value: "73,8" },
    { label: "Percentil", value: "74" },
    { label: "SG total", value: "+0,38" },
    { label: "Improvement", value: "1,1 slag/år" },
    { label: "Climber-rank", value: "22 / 118" },
    { label: "Total starts", value: "22" },
  ],
};

const DIFFS: Array<{ label: string; value: string; tone: "pos" | "neg" }> = [
  { label: "avg runde", value: "−3,7 slag", tone: "pos" },
  { label: "percentil", value: "+20 pp", tone: "pos" },
  { label: "SG total", value: "+0,86", tone: "pos" },
  { label: "improvement", value: "+0,7 slag/år", tone: "pos" },
  { label: "climber-rank", value: "19 plasser opp", tone: "pos" },
  { label: "spilte starts", value: "+6 starts", tone: "pos" },
];

// Trajectory: 3 series (Ventura ref, Markus, Anders) — alder 12–20
const AGES = [12, 13, 14, 15, 16, 17, 18, 19, 20];
const VENTURA = [78.0, 76.5, 74.8, 73.6, 72.6, 71.8, 71.2, 70.6, 70.2];
const MARKUS_TRAJ = [75.8, 73.4, 71.6, 70.1, NaN, NaN, NaN, NaN, NaN]; // 12–15
const ANDERS_TRAJ = [77.0, 75.8, 74.4, 73.8, NaN, NaN, NaN, NaN, NaN]; // 13–16 (offset by 1)

export default function TalentSammenlignToDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-8 py-8">
        {/* PageHeader */}
        <header className="mb-6 flex items-end justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Talent · Sammenlign to spillere
            </span>
            <h1 className="mt-1.5 font-display text-[36px] font-bold leading-[1.1] tracking-tight">
              <em className="font-medium italic">Markus</em> vs Anders Nedrum
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground hover:bg-secondary">
              <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              Tilbake
            </button>
            <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground">
              <Download className="h-4 w-4" strokeWidth={1.5} />
              Eksporter rapport
            </button>
          </div>
        </header>

        {/* Picker-row */}
        <div className="mb-6 flex items-center gap-4 rounded-lg border border-border bg-card p-4">
          <PickerInput value="Markus Roinås Pedersen" />
          <span className="font-display text-[20px] italic text-muted-foreground">
            vs
          </span>
          <PickerInput value="Anders Nedrum" />
          <button className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-dashed border-border bg-background px-4 py-2 text-[12px] font-medium text-muted-foreground hover:bg-secondary">
            <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
            Tredje spiller
          </button>
        </div>

        {/* 3-col layout */}
        <div className="mb-6 grid grid-cols-[5fr_2fr_5fr] gap-4">
          <PlayerCard player={MARKUS} />

          {/* DiffCenter */}
          <section className="rounded-lg border border-border bg-secondary/40 p-6">
            <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Diff · Markus minus Anders
            </div>
            <div className="mt-2 text-center">
              <span className="font-display text-[40px] italic leading-none">
                vs
              </span>
            </div>
            <ul className="mt-5 space-y-2.5">
              {DIFFS.map((d) => (
                <li
                  key={d.label}
                  className={`rounded-md px-4 py-2 ${
                    d.tone === "pos"
                      ? "bg-primary/10 text-success"
                      : "bg-[#FBE4E4] text-destructive"
                  }`}
                >
                  <div className="font-mono text-[14px] font-semibold tabular-nums leading-none">
                    {d.value}
                  </div>
                  <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.06em] opacity-80">
                    {d.label}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <PlayerCard player={ANDERS} />
        </div>

        {/* Trajectory full-width */}
        <section className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Score-trajectory vs. Kris Ventura referansekurve
              </div>
              <h3 className="mt-1 font-display text-[18px] font-semibold leading-snug">
                Hvor ligger de versus Ventura ved samme alder?
              </h3>
            </div>
            <div className="flex items-center gap-4 text-[11px] font-medium text-muted-foreground">
              <LegendLine color="hsl(40 80% 50%)" label="Ventura ref." dashed />
              <LegendLine color="hsl(159 100% 17%)" label="Markus" />
              <LegendLine color="hsl(200 70% 45%)" label="Anders" />
            </div>
          </div>

          <TrajectoryChart
            ages={AGES}
            ventura={VENTURA}
            markus={MARKUS_TRAJ}
            anders={ANDERS_TRAJ}
          />

          <p className="mt-4 max-w-[860px] text-[12px] leading-snug text-muted-foreground">
            Ved 14 år lå Ventura på score{" "}
            <b className="font-semibold tabular-nums text-foreground">74,8</b> ·
            Markus er nå på{" "}
            <b className="font-semibold tabular-nums text-foreground">70,1</b>{" "}
            (−4,7 foran Ventura ved samme alder). Anders ved 16 lå{" "}
            <em className="italic">over Venturas 14-års-trajektori</em> men har
            stagnert siste 6 mnd.
          </p>
        </section>
      </div>
    </div>
  );
}

function PickerInput({ value }: { value: string }) {
  return (
    <div className="flex flex-1 items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-[13px]">
      <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
      <span className="text-foreground">{value}</span>
      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
    </div>
  );
}

function PlayerCard({ player }: { player: PlayerData }) {
  const avatarBg =
    player.avatar === "primary"
      ? "bg-primary text-primary-foreground"
      : "bg-[#E2EEF6] text-[#114B70]";
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-start gap-4">
        <div className={`grid h-20 w-20 place-items-center rounded-full ${avatarBg}`}>
          <span className="font-display text-[28px] font-semibold leading-none">
            {player.initials}
          </span>
        </div>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            {player.club}
          </span>
          <div className="mt-1 font-display text-[22px] font-semibold leading-tight">
            {player.name}
          </div>
          <div className="mt-1 text-[12px] text-muted-foreground">
            {player.age} år · HCP {player.hcp}
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Pill tone={player.formPill.tone}>{player.formPill.text}</Pill>
            <Pill tone={player.talentPill.tone}>{player.talentPill.text}</Pill>
          </div>
        </div>
      </div>

      {/* Radar */}
      <div className="mt-5 grid place-items-center rounded-lg bg-secondary/30 p-4">
        <SGRadar values={player.sg} color={player.avatar === "primary" ? "hsl(159 100% 17%)" : "hsl(200 70% 45%)"} />
      </div>

      {/* 6 stats */}
      <ul className="mt-5 divide-y divide-border">
        {player.stats.map((s) => (
          <li
            key={s.label}
            className="flex items-center justify-between py-2.5 text-[13px]"
          >
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-mono font-semibold tabular-nums">
              {s.value}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SGRadar({ values, color }: { values: number[]; color: string }) {
  const cx = 120;
  const cy = 110;
  const r = 84;
  const axes = ["OTT", "APP", "ARG", "PUT", "OG"];
  const cohort = axes.map(() => 0.55);

  const pointFor = (val: number, i: number) => {
    const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    return [cx + Math.cos(angle) * r * val, cy + Math.sin(angle) * r * val];
  };
  const polyOf = (vals: number[]) =>
    vals.map((v, i) => pointFor(v, i).join(",")).join(" ");

  return (
    <svg width="240" height="220" viewBox="0 0 240 220">
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <polygon
          key={g}
          points={polyOf(axes.map(() => g))}
          fill="none"
          stroke="hsl(60 8% 90%)"
          strokeWidth={0.75}
        />
      ))}
      {axes.map((_, i) => {
        const [x, y] = pointFor(1, i);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="hsl(60 8% 90%)"
            strokeWidth={0.75}
          />
        );
      })}
      <polygon
        points={polyOf(cohort)}
        fill="hsl(60 4% 37% / 0.10)"
        stroke="hsl(60 4% 37%)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      <polygon
        points={polyOf(values)}
        fill={`${color.replace(")", " / 0.22)").replace("hsl(", "hsl(")}`}
        stroke={color}
        strokeWidth={2}
      />
      {axes.map((a, i) => {
        const [x, y] = pointFor(1.15, i);
        return (
          <text
            key={a}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fontFamily="ui-monospace, monospace"
            fontWeight="600"
            fill="hsl(157 53% 8%)"
          >
            {a}
          </text>
        );
      })}
    </svg>
  );
}

function TrajectoryChart({
  ages,
  ventura,
  markus,
  anders,
}: {
  ages: number[];
  ventura: number[];
  markus: number[];
  anders: number[];
}) {
  const w = 1100;
  const h = 280;
  const pad = 36;

  const allVals = [
    ...ventura,
    ...markus.filter((v) => !Number.isNaN(v)),
    ...anders.filter((v) => !Number.isNaN(v)),
  ];
  const min = Math.min(...allVals) - 1;
  const max = Math.max(...allVals) + 1;

  const scaleX = (i: number) =>
    pad + (i / (ages.length - 1)) * (w - pad * 2);
  const scaleY = (v: number) =>
    h - pad - ((v - min) / (max - min)) * (h - pad * 2);

  const pathFor = (arr: number[]) => {
    const valid = arr
      .map((v, i) => ({ v, i }))
      .filter((p) => !Number.isNaN(p.v));
    return (
      "M " + valid.map((p) => `${scaleX(p.i)} ${scaleY(p.v)}`).join(" L ")
    );
  };

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
      {/* gridlines */}
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1={pad}
          y1={pad + g * (h - pad * 2)}
          x2={w - pad}
          y2={pad + g * (h - pad * 2)}
          stroke="hsl(60 8% 90%)"
          strokeWidth={0.75}
          strokeDasharray="3 3"
        />
      ))}
      {/* x-labels */}
      {ages.map((a, i) => (
        <text
          key={a}
          x={scaleX(i)}
          y={h - 10}
          textAnchor="middle"
          fontSize="10"
          fontFamily="ui-monospace, monospace"
          fill="hsl(60 4% 37%)"
        >
          {a} år
        </text>
      ))}

      <path
        d={pathFor(ventura)}
        fill="none"
        stroke="hsl(40 80% 50%)"
        strokeWidth={2.5}
        strokeDasharray="5 4"
      />
      <path
        d={pathFor(markus)}
        fill="none"
        stroke="hsl(159 100% 17%)"
        strokeWidth={3}
      />
      <path
        d={pathFor(anders)}
        fill="none"
        stroke="hsl(200 70% 45%)"
        strokeWidth={3}
      />

      {/* markers */}
      {markus.map((v, i) =>
        Number.isNaN(v) ? null : (
          <circle
            key={`m${i}`}
            cx={scaleX(i)}
            cy={scaleY(v)}
            r={4}
            fill="hsl(159 100% 17%)"
            stroke="white"
            strokeWidth={1.5}
          />
        ),
      )}
      {anders.map((v, i) =>
        Number.isNaN(v) ? null : (
          <circle
            key={`a${i}`}
            cx={scaleX(i)}
            cy={scaleY(v)}
            r={4}
            fill="hsl(200 70% 45%)"
            stroke="white"
            strokeWidth={1.5}
          />
        ),
      )}
    </svg>
  );
}

function Pill({
  tone = "muted",
  children,
}: {
  tone?: "info" | "muted" | "success" | "danger" | "warning";
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    info: "bg-[#E2EEF6] text-[#114B70]",
    success: "bg-primary/10 text-success",
    danger: "bg-[#FBE4E4] text-destructive",
    warning: "bg-[#FFF0D6] text-warning",
    muted: "bg-secondary text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function LegendLine({
  color,
  label,
  dashed = false,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="22" height="8" viewBox="0 0 22 8">
        <line
          x1="0"
          y1="4"
          x2="22"
          y2="4"
          stroke={color}
          strokeWidth={2}
          strokeDasharray={dashed ? "4 3" : undefined}
        />
      </svg>
      {label}
    </span>
  );
}
