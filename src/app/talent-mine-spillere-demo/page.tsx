/**
 * DEMO — CoachHQ Talent · Mine spillere
 * Spec: _extracted/talent-design/uploads/01-mine-spillere.md
 * URL: /talent-mine-spillere-demo
 *
 * Default state: lyst tema, ingen sidebar/shell. Server component.
 */

import {
  Search,
  Plus,
  AlertTriangle,
  ChevronRight,
  Calendar,
  ArrowRight,
  StickyNote,
  Sparkles,
} from "lucide-react";

type AttentionTone = "danger" | "warning" | "success" | "muted";

type Player = {
  id: string;
  initials: string;
  name: string;
  age: number;
  club: string;
  hcp: string;
  form: string;
  formTone: AttentionTone;
  percentile: string;
  avgRound: string;
  attention?: { text: string; tone: AttentionTone };
};

const PLAYERS: Player[] = [
  {
    id: "joachim-vik",
    initials: "JV",
    name: "Joachim Vik",
    age: 15,
    club: "GFGK",
    hcp: "8,9",
    form: "Form −12 %",
    formTone: "danger",
    percentile: "48. pct",
    avgRound: "76,4",
    attention: {
      text: "Form-fall 14 d · trenger 1:1",
      tone: "danger",
    },
  },
  {
    id: "anders-nedrum",
    initials: "AN",
    name: "Anders Nedrum",
    age: 17,
    club: "GFGK",
    hcp: "5,2",
    form: "Form +4 %",
    formTone: "success",
    percentile: "74. pct",
    avgRound: "73,8",
    attention: {
      text: "Mangler fysisk-test før 24. mai",
      tone: "warning",
    },
  },
  {
    id: "markus-roinas-pedersen",
    initials: "MP",
    name: "Markus Roinås Pedersen",
    age: 16,
    club: "WANG Toppidrett",
    hcp: "+2,4",
    form: "Form +8 %",
    formTone: "success",
    percentile: "94. pct",
    avgRound: "70,1",
    attention: {
      text: "Nordic Tour Q1 · 28. mai",
      tone: "warning",
    },
  },
  {
    id: "mia-berg",
    initials: "MB",
    name: "Mia Berg",
    age: 16,
    club: "WANG Toppidrett",
    hcp: "4,9",
    form: "Form +2 %",
    formTone: "success",
    percentile: "78. pct",
    avgRound: "73,2",
  },
  {
    id: "lina-hellesund",
    initials: "LH",
    name: "Lina Hellesund",
    age: 18,
    club: "GFGK",
    hcp: "4,1",
    form: "Stabil",
    formTone: "muted",
    percentile: "71. pct",
    avgRound: "73,5",
  },
  {
    id: "henrik-nilsen",
    initials: "HN",
    name: "Henrik Nilsen",
    age: 19,
    club: "GFGK",
    hcp: "8,7",
    form: "Form −3 %",
    formTone: "warning",
    percentile: "52. pct",
    avgRound: "75,9",
  },
  {
    id: "emma-solberg",
    initials: "ES",
    name: "Emma Solberg",
    age: 18,
    club: "Mulligan",
    hcp: "8,7",
    form: "Stabil",
    formTone: "muted",
    percentile: "55. pct",
    avgRound: "75,4",
  },
];

const FRIST_ITEMS: Array<{
  date: string;
  weekday: string;
  label: string;
  sub: string;
  urgent?: boolean;
}> = [
  { date: "14", weekday: "tirs", label: "Fysisk-test", sub: "GFGK · Anders N.", urgent: true },
  { date: "16", weekday: "tors", label: "Range-økt", sub: "Markus · 09:00" },
  { date: "21", weekday: "tirs", label: "TrackMan-test", sub: "Mia + Joachim" },
  { date: "24", weekday: "fred", label: "Fysisk-test", sub: "Mulligan · gruppe A" },
  { date: "28", weekday: "tirs", label: "Nordic Tour Q1", sub: "Markus · runde 1" },
  { date: "04", weekday: "tirs", label: "Test-evaluering", sub: "Q2 oppsummering" },
  { date: "11", weekday: "tirs", label: "Foreldremøte", sub: "WANG · 18:00" },
];

const SORT_OPTIONS: Array<{ label: string; active?: boolean }> = [
  { label: "Trenger oppmerksomhet", active: true },
  { label: "Form" },
  { label: "Improvement" },
  { label: "ABC" },
];

export default function TalentMineSpillereDemo() {
  const selected = PLAYERS[1]; // Anders Nedrum
  const attentionCount = PLAYERS.filter((p) => p.attention).length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-8 py-8">
        {/* PageHeader */}
        <header className="mb-6 flex items-end justify-between">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Daglig workspace · Talent · Mine spillere
            </span>
            <h1 className="mt-1.5 font-display text-[36px] font-bold leading-[1.1] tracking-tight">
              <em className="font-medium italic">Mine</em> spillere
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px] text-muted-foreground">
              <Search className="h-4 w-4" strokeWidth={1.5} />
              <span>Søk spiller</span>
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
              <Plus className="h-4 w-4" strokeWidth={1.5} />
              Ny spiller
            </button>
          </div>
        </header>

        {/* ActionStrip — mørk forest gradient */}
        <div
          className="mb-6 flex items-center gap-4 rounded-lg border border-[#003329] px-6 py-4 text-[13px] text-[#F5F4EE]"
          style={{
            background:
              "linear-gradient(135deg, hsl(159 100% 12%) 0%, hsl(159 100% 17%) 100%)",
          }}
        >
          <AlertTriangle
            className="h-5 w-5 shrink-0 text-accent"
            strokeWidth={1.5}
          />
          <p className="leading-snug">
            <b className="font-semibold">
              {attentionCount} spillere trenger oppmerksomhet i dag
            </b>{" "}
            <span className="opacity-80">
              · 1 form-fall, 1 manglende test, 1 turnering fredag
            </span>
          </p>
          <button className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-[12px] font-semibold text-accent-foreground">
            Åpne første
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>
        </div>

        {/* FristStrip */}
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Kommende frister · 8 uker
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">
              mai – juni 2026
            </span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {FRIST_ITEMS.map((f) => (
              <div
                key={f.date + f.label}
                className={`rounded-lg border bg-card p-3 transition-colors hover:border-primary/40 ${
                  f.urgent ? "border-[#B8852A]" : "border-border"
                }`}
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[24px] font-semibold tabular-nums leading-none">
                    {f.date}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {f.weekday}
                  </span>
                </div>
                <div className="mt-2 text-[12px] font-semibold leading-tight">
                  {f.label}
                </div>
                <div className="mt-1 text-[11px] leading-tight text-muted-foreground">
                  {f.sub}
                </div>
                {f.urgent && (
                  <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#FFF0D6] px-2 py-0.5 text-[10px] font-medium text-[#B8852A]">
                    haster
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Two-pane: liste + drawer */}
        <div className="grid grid-cols-[minmax(0,1fr)_420px] gap-6">
          {/* List column */}
          <section>
            {/* FilterRow */}
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Sortering
              </span>
              {SORT_OPTIONS.map((o) => (
                <button
                  key={o.label}
                  className={`rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
                    o.active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>

            {/* Player list */}
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <div className="border-b border-border bg-secondary/40 px-4 py-2.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Trenger oppmerksomhet ({attentionCount})
                </span>
              </div>
              <ul>
                {PLAYERS.filter((p) => p.attention).map((p) => (
                  <PlayerRow key={p.id} player={p} selected={p.id === selected.id} />
                ))}
              </ul>

              <div className="border-y border-border bg-secondary/40 px-4 py-2.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Andre spillere ({PLAYERS.length - attentionCount})
                </span>
              </div>
              <ul>
                {PLAYERS.filter((p) => !p.attention).map((p) => (
                  <PlayerRow key={p.id} player={p} />
                ))}
              </ul>
            </div>
          </section>

          {/* Drawer */}
          <aside className="self-start rounded-lg border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-[88px] w-[88px] place-items-center rounded-full bg-primary text-primary-foreground">
                <span className="font-display text-[32px] font-semibold leading-none">
                  {selected.initials}
                </span>
              </div>
              <div>
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  Talent · A2-kandidat
                </span>
                <div className="mt-1 font-display text-[22px] font-semibold leading-tight">
                  {selected.name}
                </div>
                <div className="mt-1 text-[12px] text-muted-foreground">
                  {selected.club} · {selected.age} år · HCP {selected.hcp}
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Pill tone="success">{selected.form}</Pill>
                  <Pill tone="info">Talent 74</Pill>
                </div>
              </div>
            </div>

            {/* Mørkt action-kort */}
            <div
              className="mt-5 rounded-lg p-4 text-[#F5F4EE]"
              style={{
                background:
                  "linear-gradient(135deg, hsl(159 100% 12%) 0%, hsl(159 100% 17%) 100%)",
              }}
            >
              <div className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-accent">
                <Sparkles className="h-3 w-3" strokeWidth={1.5} />
                Agent-forslag · 90 d
              </div>
              <p className="mt-2 font-display text-[18px] italic leading-snug">
                Approach 100–125y
              </p>
              <p className="mt-1.5 text-[12px] leading-snug opacity-80">
                Anders taper −0,38 SG mot peer på denne distansen. Sett opp 3
                tester denne uken.
              </p>
              <button className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-[12px] font-semibold text-accent-foreground">
                Planlegg test
                <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
              </button>
            </div>

            {/* 4 mini-stats 2x2 */}
            <div className="mt-5 grid grid-cols-2 gap-3">
              <MiniStat label="Avg runde" value="73,8" delta="−0,4" tone="success" />
              <MiniStat label="Percentil" value="74" delta="+3" tone="success" />
              <MiniStat label="SG total" value="+0,38" delta="+0,12" tone="success" />
              <MiniStat label="Adherence" value="88 %" delta="stabilt" tone="muted" />
            </div>

            {/* SG mini-radar */}
            <div className="mt-5 rounded-lg border border-border bg-secondary/30 p-4">
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                SG-profil
              </div>
              <div className="mt-2 grid place-items-center">
                <MiniRadar />
              </div>
            </div>

            {/* Hurtignotat */}
            <div className="mt-5">
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                <StickyNote className="h-3 w-3" strokeWidth={1.5} />
                Hurtig-notat
              </div>
              <div className="mt-2 rounded-md border border-input bg-background p-3 text-[12px] text-muted-foreground">
                Klikk for å notere observasjon fra dagens økt …
              </div>
            </div>

            <button className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
              Åpne 360-profil
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}

function PlayerRow({
  player,
  selected = false,
}: {
  player: Player;
  selected?: boolean;
}) {
  return (
    <li
      className={`grid grid-cols-[48px_minmax(0,1fr)_auto_auto_auto_auto] items-center gap-4 border-b border-border px-4 py-3 last:border-b-0 ${
        selected ? "bg-primary/5" : "hover:bg-secondary/40"
      }`}
    >
      <div className="grid h-12 w-12 place-items-center rounded-full bg-secondary text-foreground">
        <span className="font-display text-[16px] font-semibold leading-none">
          {player.initials}
        </span>
      </div>
      <div>
        <div className="text-[13px] font-semibold leading-tight">
          {player.name}
        </div>
        <div className="mt-1 text-[11px] text-muted-foreground">
          {player.club} · {player.age} år · HCP {player.hcp}
        </div>
      </div>
      <Pill tone={player.formTone}>{player.form}</Pill>
      <Pill tone="muted">{player.percentile}</Pill>
      <span className="font-mono text-[14px] font-semibold tabular-nums">
        {player.avgRound}
      </span>
      {player.attention ? (
        <Pill tone={player.attention.tone}>{player.attention.text}</Pill>
      ) : (
        <ChevronRight
          className="h-4 w-4 text-muted-foreground"
          strokeWidth={1.5}
        />
      )}
    </li>
  );
}

function Pill({
  tone = "muted",
  children,
}: {
  tone?: AttentionTone | "info";
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    danger: "bg-[#FBE4E4] text-[#A32D2D]",
    warning: "bg-[#FFF0D6] text-[#B8852A]",
    success: "bg-[#E5F1EA] text-[#1A7D56]",
    muted: "bg-secondary text-muted-foreground",
    info: "bg-primary/10 text-primary",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}

function MiniStat({
  label,
  value,
  delta,
  tone = "success",
}: {
  label: string;
  value: string;
  delta: string;
  tone?: "success" | "muted";
}) {
  const deltaCls =
    tone === "success"
      ? "text-[#1A7D56]"
      : "text-muted-foreground";
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-3">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1.5 font-mono text-[18px] font-semibold tabular-nums leading-none">
        {value}
      </div>
      <div className={`mt-1.5 font-mono text-[10px] font-medium ${deltaCls}`}>
        {delta}
      </div>
    </div>
  );
}

function MiniRadar() {
  // 5-aksers SG-radar — SVG poly
  const cx = 90;
  const cy = 80;
  const r = 56;
  const axes = ["OTT", "APP", "ARG", "PUT", "OG"];
  const player = [0.78, 0.62, 0.55, 0.71, 0.68];
  const cohort = [0.55, 0.55, 0.55, 0.55, 0.55];

  const pointFor = (val: number, i: number) => {
    const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
    return [cx + Math.cos(angle) * r * val, cy + Math.sin(angle) * r * val];
  };
  const polyOf = (vals: number[]) =>
    vals.map((v, i) => pointFor(v, i).join(",")).join(" ");

  return (
    <svg width="180" height="160" viewBox="0 0 180 160">
      {/* gridrings */}
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <polygon
          key={g}
          points={polyOf(axes.map(() => g))}
          fill="none"
          stroke="hsl(60 8% 90%)"
          strokeWidth={0.75}
        />
      ))}
      {/* axes */}
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
      {/* cohort */}
      <polygon
        points={polyOf(cohort)}
        fill="hsl(60 4% 37% / 0.15)"
        stroke="hsl(60 4% 37%)"
        strokeWidth={1}
        strokeDasharray="3 3"
      />
      {/* player */}
      <polygon
        points={polyOf(player)}
        fill="hsl(159 100% 17% / 0.20)"
        stroke="hsl(159 100% 17%)"
        strokeWidth={1.5}
      />
      {/* labels */}
      {axes.map((a, i) => {
        const [x, y] = pointFor(1.18, i);
        return (
          <text
            key={a}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fontFamily="ui-monospace, monospace"
            fill="hsl(60 4% 37%)"
          >
            {a}
          </text>
        );
      })}
    </svg>
  );
}
