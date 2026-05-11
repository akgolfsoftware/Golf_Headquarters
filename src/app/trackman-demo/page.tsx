/**
 * PILOT — PlayerHQ TrackMan-analyse
 * Bygd direkte fra wireframe/design-files-v2/playerhq-A/05-trackman.html
 * URL: /trackman-demo
 *
 * Mock-data: Markus Roinås Pedersen, mai 2026.
 * Pro-tier rendres med full visning. Hele TrackMan-trendvisningen er
 * Pro-only — Free-brukere ser Lock-overlay på hovedinnholdet.
 */

import { ArrowRight, Lock, Upload } from "lucide-react";

export default function TrackmanDemo() {
  return (
    <div className="min-h-screen bg-[var(--color-card,#FFFFFF)] text-foreground p-8">
      <Head />
      <ActionStrip />
      <ClubRail />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
        <div>
          <TrajectoryCard />
          <KpiStrip />
          <BentoBottom />
        </div>
        <Drawer />
      </div>
    </div>
  );
}

function Head() {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-6">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground mb-2.5">
          TrackMan · sesong 2026 · trendvisning
        </div>
        <h1 className="font-display text-[36px] font-bold leading-[1.1] tracking-tight">
          <em className="font-medium italic">Min sving</em> over tid
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-2.5 text-[13px] text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            <Lock className="h-2.5 w-2.5" />
            Pro
          </span>
          <Dot />
          <span>Trendvisning på tvers av økter — ikke én enkelt rapport</span>
          <Dot />
          <span>
            <b className="text-primary">8 økter</b> denne måneden ·{" "}
            <b className="text-primary">640 slag</b> totalt
          </span>
        </p>
      </div>
      <div className="flex gap-2">
        <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium hover:bg-secondary">
          <Upload className="h-4 w-4" />
          Last opp ny økt
        </button>
        <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90">
          Eksporter til Strokes Gained
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ActionStrip() {
  const items: { tone?: "success" | "info"; body: React.ReactNode }[] = [
    { tone: "success", body: <><b>8</b> økter / 30d</> },
    { body: <><b>640</b> slag</> },
    { tone: "success", body: <><b>+6 m</b> driver carry / 30d</> },
    { tone: "info", body: <><b>−1,2°</b> launch / 30d</> },
    { body: <><b>78 %</b> i target 7i</> },
  ];
  const styles: Record<string, string> = {
    default:
      "border-border bg-card text-muted-foreground [&_b]:text-foreground",
    success:
      "border-[rgba(34,184,103,0.25)] bg-[rgba(34,184,103,0.10)] text-[var(--status-success,#1A7D56)] [&_b]:text-[var(--status-success,#1A7D56)]",
    info: "border-[rgba(59,130,246,0.20)] bg-[rgba(59,130,246,0.10)] text-[#1D4ED8] [&_b]:text-[#1D4ED8]",
  };
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-md border border-border bg-card px-5 py-3.5">
      <span className="mr-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        Sving-status
      </span>
      {items.map((it, i) => (
        <span
          key={i}
          className={`inline-flex items-center gap-1.5 rounded-md border px-3.5 py-2 text-[12px] font-medium [&_b]:font-mono [&_b]:font-medium [&_b]:tabular-nums ${styles[it.tone ?? "default"]}`}
        >
          {it.body}
        </span>
      ))}
    </div>
  );
}

function ClubRail() {
  const clubs = [
    { name: "Driver", num: "160 slag" },
    { name: "3W", num: "48 slag" },
    { name: "5-jern", num: "72 slag" },
    { name: "7-jern", num: "80 slag", active: true },
    { name: "9-jern", num: "96 slag" },
    { name: "PW", num: "88 slag" },
    { name: "SW", num: "64 slag" },
    { name: "Putter", num: "32 slag" },
  ];
  return (
    <div className="mb-5 flex items-center gap-2 overflow-x-auto rounded-md border border-border bg-card px-4 py-3">
      <span className="mr-1 flex-shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        Per kølle
      </span>
      {clubs.map((c) => (
        <button
          key={c.name}
          className={`inline-flex items-center gap-2 whitespace-nowrap rounded-md px-3.5 py-2 text-[13px] font-medium transition-colors ${
            c.active
              ? "bg-primary text-accent"
              : "text-muted-foreground hover:bg-secondary"
          }`}
        >
          {c.name}
          <span
            className={`font-mono text-[11px] tabular-nums ${c.active ? "opacity-85" : "opacity-70"}`}
          >
            {c.num}
          </span>
        </button>
      ))}
    </div>
  );
}

function TrajectoryCard() {
  return (
    <section className="mb-4 rounded-lg border border-border bg-card px-6 py-5">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            7-jern · trajectory over tid
          </div>
          <h3 className="mt-1 font-display text-[18px] font-bold leading-snug">
            Hvordan slaget endrer seg
          </h3>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
          FRA
          <span className="inline-block h-1 w-5 rounded-sm bg-[rgba(0,88,64,0.20)]" />
          <span className="inline-block h-1 w-5 rounded-sm bg-[rgba(0,88,64,0.45)]" />
          <span className="inline-block h-1 w-5 rounded-sm bg-[rgba(0,88,64,0.70)]" />
          <span className="inline-block h-1 w-5 rounded-sm bg-primary" />
          TIL NÅ
        </div>
      </div>

      <svg
        viewBox="0 0 800 320"
        preserveAspectRatio="xMidYMid meet"
        className="block h-80 w-full rounded-md"
        style={{
          background:
            "linear-gradient(180deg, rgba(135,206,235,0.05) 0%, rgba(135,206,235,0) 60%, rgba(0,88,64,0.04) 100%)",
        }}
      >
        <line x1="40" y1="280" x2="780" y2="280" stroke="#0A1F18" strokeWidth="1.5" />
        {[
          ["0 m", 40],
          ["60 m", 200],
          ["120 m", 360],
          ["160 m", 520],
          ["200 m", 680],
        ].map(([label, x]) => (
          <text
            key={label as string}
            x={x as number}
            y="298"
            fill="#7A7666"
            fontFamily="monospace"
            fontSize="10"
          >
            {label}
          </text>
        ))}
        {[
          ["0", 280],
          ["8m", 220],
          ["16m", 160],
          ["24m", 100],
        ].map(([label, y]) => (
          <text
            key={label as string}
            x="35"
            y={y as number}
            textAnchor="end"
            fill="#7A7666"
            fontFamily="monospace"
            fontSize="10"
          >
            {label}
          </text>
        ))}

        <path d="M 40 280 Q 280 70 530 280" fill="none" stroke="#005840" strokeWidth="2" opacity="0.18" />
        <path d="M 40 280 Q 290 90 545 280" fill="none" stroke="#005840" strokeWidth="2" opacity="0.30" />
        <path d="M 40 280 Q 300 110 555 280" fill="none" stroke="#005840" strokeWidth="2" opacity="0.45" />
        <path d="M 40 280 Q 310 125 565 280" fill="none" stroke="#005840" strokeWidth="2.2" opacity="0.60" />
        <path d="M 40 280 Q 320 130 575 280" fill="none" stroke="#005840" strokeWidth="2.5" opacity="0.82" />
        <path d="M 40 280 Q 330 132 585 280" fill="none" stroke="#005840" strokeWidth="3" />

        <circle cx="280" cy="70" r="4" fill="#005840" opacity="0.30" />
        <text x="280" y="62" textAnchor="middle" fill="#005840" fontFamily="monospace" fontSize="9" opacity="0.6">
          apex 24 m · 08.03
        </text>
        <circle cx="330" cy="132" r="6" fill="#D1F843" stroke="#005840" strokeWidth="2.5" />
        <text x="330" y="122" textAnchor="middle" fill="#005840" fontFamily="monospace" fontSize="9" fontWeight="700">
          apex 18 m · 14.05
        </text>

        <circle cx="530" cy="280" r="3" fill="#005840" opacity="0.30" />
        <circle cx="585" cy="280" r="5" fill="#005840" />
        <line x1="530" y1="288" x2="585" y2="288" stroke="#005840" strokeWidth="2" strokeLinecap="round" />
        <text x="557" y="312" textAnchor="middle" fill="#005840" fontFamily="monospace" fontSize="10" fontWeight="700">
          +8 m carry
        </text>

        <text x="700" y="60" fill="#7A7666" fontFamily="monospace" fontSize="9" opacity="0.55">
          VIND ↘ 3 m/s
        </text>
      </svg>

      <p className="mt-4 border-t border-border pt-3.5 text-[13px] leading-relaxed text-muted-foreground">
        <b className="text-foreground">Hva endret seg:</b> Apex har sunket fra
        24 m til 18 m (lavere ball-flight) og carry har økt fra ca 152 m til 162
        m. Det er bra — du får mer rull og mindre vind-eksponering. Pro-coach
        Anders K. har bekreftet retningen 12. mai.
      </p>
    </section>
  );
}

type Kpi = {
  label: string;
  delta: string;
  deltaTone: "up" | "down" | "flat";
  value: string;
  unit?: string;
  sub: string;
  sparkPath: string;
  sparkFill: string;
  sparkStroke: string;
  sparkAreaPath: string;
  endX: number;
  endY: number;
  endColor: string;
};

const kpis: Kpi[] = [
  {
    label: "Snitt carry",
    delta: "+6 m",
    deltaTone: "up",
    value: "162",
    unit: " m",
    sub: "8 økter",
    sparkPath: "0,20 25,16 50,12 75,8 100,5",
    sparkAreaPath: "0,28 0,20 25,16 50,12 75,8 100,5 100,28",
    sparkFill: "rgba(0,88,64,0.10)",
    sparkStroke: "#005840",
    endX: 100,
    endY: 5,
    endColor: "#D1F843",
  },
  {
    label: "Launch",
    delta: "−1,2°",
    deltaTone: "down",
    value: "17,4",
    unit: "°",
    sub: "target 17–18°",
    sparkPath: "0,6 25,10 50,14 75,16 100,18",
    sparkAreaPath: "0,28 0,6 25,10 50,14 75,16 100,18 100,28",
    sparkFill: "rgba(59,130,246,0.08)",
    sparkStroke: "#3B82F6",
    endX: 100,
    endY: 18,
    endColor: "#3B82F6",
  },
  {
    label: "Spin",
    delta: "stabilt",
    deltaTone: "flat",
    value: "7 280",
    unit: " rpm",
    sub: "i target",
    sparkPath: "0,14 25,16 50,12 75,14 100,14",
    sparkAreaPath: "0,28 0,14 25,16 50,12 75,14 100,14 100,28",
    sparkFill: "rgba(122,118,102,0.08)",
    sparkStroke: "#7A7666",
    endX: 100,
    endY: 14,
    endColor: "#7A7666",
  },
  {
    label: "Smash",
    delta: "+0,02",
    deltaTone: "up",
    value: "1,38",
    sub: "target 1,38–1,42",
    sparkPath: "0,16 25,14 50,12 75,10 100,8",
    sparkAreaPath: "0,28 0,16 25,14 50,12 75,10 100,8 100,28",
    sparkFill: "rgba(0,88,64,0.10)",
    sparkStroke: "#005840",
    endX: 100,
    endY: 8,
    endColor: "#005840",
  },
  {
    label: "Dispersion",
    delta: "−2,1 m",
    deltaTone: "up",
    value: "±5,2",
    unit: " m",
    sub: "snittet inn",
    sparkPath: "0,6 25,10 50,14 75,18 100,20",
    sparkAreaPath: "0,28 0,6 25,10 50,14 75,18 100,20 100,28",
    sparkFill: "rgba(0,88,64,0.10)",
    sparkStroke: "#005840",
    endX: 100,
    endY: 20,
    endColor: "#005840",
  },
];

function KpiStrip() {
  return (
    <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-5">
      {kpis.map((k) => (
        <article key={k.label} className="rounded-md border border-border bg-card p-4">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              {k.label}
            </span>
            <span
              className={`rounded-sm px-1.5 py-0.5 font-mono text-[10px] font-semibold ${
                k.deltaTone === "up"
                  ? "bg-[rgba(34,184,103,0.10)] text-[var(--status-success,#1A7D56)]"
                  : k.deltaTone === "down"
                    ? "bg-[rgba(59,130,246,0.10)] text-[#1D4ED8]"
                    : "bg-secondary text-muted-foreground"
              }`}
            >
              {k.delta}
            </span>
          </div>
          <div className="mb-0.5 font-mono text-[26px] font-medium leading-tight tabular-nums -tracking-tight">
            {k.value}
            {k.unit && (
              <small className="text-[13px] font-normal text-muted-foreground">
                {k.unit}
              </small>
            )}
          </div>
          <div className="mb-2 font-mono text-[11px] text-muted-foreground">
            {k.sub}
          </div>
          <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="block h-7 w-full">
            <polyline points={k.sparkAreaPath} fill={k.sparkFill} stroke="none" />
            <polyline
              points={k.sparkPath}
              fill="none"
              stroke={k.sparkStroke}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <circle cx={k.endX} cy={k.endY} r="2.5" fill={k.endColor} stroke={k.sparkStroke} strokeWidth="1" />
          </svg>
        </article>
      ))}
    </section>
  );
}

function BentoBottom() {
  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.25fr_1fr]">
      <Dispersion />
      <Compare />
    </section>
  );
}

function Dispersion() {
  const hits: { top: number; left: number; tone: "good" | "ok" | "bad"; opacity?: number }[] = [
    { top: 32, left: 48, tone: "good", opacity: 0.65 },
    { top: 38, left: 52, tone: "good", opacity: 0.75 },
    { top: 42, left: 50, tone: "good", opacity: 0.9 },
    { top: 46, left: 49, tone: "good" },
    { top: 50, left: 51, tone: "good" },
    { top: 53, left: 48, tone: "good", opacity: 0.85 },
    { top: 56, left: 52, tone: "good", opacity: 0.7 },
    { top: 36, left: 56, tone: "good", opacity: 0.6 },
    { top: 60, left: 46, tone: "good", opacity: 0.7 },
    { top: 44, left: 54, tone: "good", opacity: 0.85 },
    { top: 48, left: 47, tone: "good" },
    { top: 52, left: 53, tone: "good", opacity: 0.9 },
    { top: 58, left: 50, tone: "good", opacity: 0.8 },
    { top: 40, left: 46, tone: "good", opacity: 0.75 },
    { top: 33, left: 53, tone: "good", opacity: 0.7 },
    { top: 26, left: 44, tone: "ok", opacity: 0.85 },
    { top: 64, left: 56, tone: "ok", opacity: 0.8 },
    { top: 28, left: 60, tone: "ok", opacity: 0.75 },
    { top: 68, left: 42, tone: "ok", opacity: 0.7 },
    { top: 22, left: 38, tone: "bad" },
    { top: 70, left: 62, tone: "bad" },
  ];
  const toneColor: Record<"good" | "ok" | "bad", string> = {
    good: "var(--brand-primary,#005840)",
    ok: "#B8852A",
    bad: "rgba(163,45,45,0.7)",
  };
  return (
    <article className="rounded-lg border border-border bg-card px-6 py-5">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Dispersion-pattern · 7-jern · 80 slag
          </div>
          <h3 className="mt-1 font-display text-[18px] font-bold leading-snug">
            Hvor lander ballen?
          </h3>
        </div>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
          Snittet inn 2,1 m
        </span>
      </div>

      <div
        className="relative mt-2 min-h-[280px] rounded-md p-4"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,88,64,0.04) 0%, rgba(0,88,64,0.10) 100%)",
        }}
      >
        <div
          className="absolute"
          style={{
            top: 16,
            bottom: 16,
            left: "50%",
            transform: "translateX(-50%)",
            width: "56%",
            background: "rgba(0,88,64,0.06)",
            border: "1px dashed rgba(0,88,64,0.30)",
            borderRadius: 10,
          }}
        />
        <div
          className="absolute"
          style={{
            top: 16,
            bottom: 16,
            left: "50%",
            width: 1,
            background: "rgba(0,88,64,0.20)",
          }}
        />
        <div
          className="absolute z-10 grid place-items-center"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "2px solid var(--brand-primary,#005840)",
            background: "rgba(255,255,255,0.9)",
          }}
        >
          <span
            className="block h-2 w-2 rounded-full bg-primary"
          />
        </div>
        {hits.map((h, i) => (
          <span
            key={i}
            className="absolute h-2.5 w-2.5 rounded-full"
            style={{
              top: `${h.top}%`,
              left: `${h.left}%`,
              transform: "translate(-50%,-50%)",
              background: toneColor[h.tone],
              opacity: h.opacity ?? 1,
            }}
          />
        ))}
        <span
          className="absolute font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground"
          style={{ bottom: 8, left: "50%", transform: "translateX(-50%)" }}
        >
          FAIRWAY-MIDT
        </span>
        <span className="absolute left-3.5 top-2 font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
          VENSTRE
        </span>
        <span className="absolute right-3.5 top-2 font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
          HØYRE
        </span>
      </div>

      <div className="mt-3.5 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-primary" />
          I target (78 %)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-[#B8852A]" />
          Akseptabel (16 %)
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-destructive opacity-70" />
          Bom (6 %)
        </span>
      </div>
    </article>
  );
}

function Compare() {
  return (
    <article className="rounded-lg border border-border bg-card px-6 py-5">
      <div className="mb-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Sammenlikning · 7-jern
        </div>
        <h3 className="mt-1 font-display text-[18px] font-bold leading-snug">
          Hvor står du?
        </h3>
      </div>

      <CompareRow
        title="Mot din baseline"
        val="+6 m"
        valTone="success"
        sub="Sesongstart 156 m → nå 162 m"
        pct={100}
        barColor="var(--status-success,#1A7D56)"
      />
      <CompareRow
        title="Mot HCP-jevngamle (A2)"
        val="82. percentil"
        valTone="primary"
        sub="A2-snitt 154 m · 82 % under deg"
        pct={82}
        barColor="var(--brand-primary,#005840)"
      />
      <CompareRow
        title="Mot pro-benchmark"
        val="−12 m"
        valTone="warn"
        sub="PGA tour-snitt 174 m · gap 12 m"
        pct={93}
        barColor="#B8852A"
      />

      <div className="mt-4 rounded-md bg-accent/20 px-3.5 py-3">
        <p className="text-[12px] leading-relaxed text-foreground">
          For din alder (16) er gapet til pro <b>mindre enn snitt</b> — du
          henger med i utviklingen.
        </p>
      </div>
    </article>
  );
}

function CompareRow({
  title,
  val,
  valTone,
  sub,
  pct,
  barColor,
}: {
  title: string;
  val: string;
  valTone: "success" | "primary" | "warn";
  sub: string;
  pct: number;
  barColor: string;
}) {
  const valCls =
    valTone === "success"
      ? "text-[var(--status-success,#1A7D56)]"
      : valTone === "primary"
        ? "text-primary"
        : "text-[var(--status-warning,#B8852A)]";
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1.5 flex items-baseline justify-between">
        <strong className="text-[13px] font-medium text-foreground">
          {title}
        </strong>
        <span className={`font-mono text-[14px] font-medium tabular-nums ${valCls}`}>
          {val}
        </span>
      </div>
      <div className="mb-2 font-mono text-[11px] text-muted-foreground">{sub}</div>
      <div className="h-1.5 overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
    </div>
  );
}

function Drawer() {
  return (
    <aside className="sticky top-5 self-start overflow-hidden rounded-lg border border-border bg-card">
      <div className="border-b border-border px-6 py-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Agent-funn · oppdatert 14.05
        </div>
        <h3 className="mt-1.5 font-display text-[18px] font-bold leading-snug">
          Hva sier dataen?
        </h3>
        <div className="mt-1 font-mono text-[11px] text-muted-foreground">
          3 funn på tvers av køller
        </div>
        <div className="mt-2.5 flex gap-1.5">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{
              background: "rgba(26,125,86,0.10)",
              color: "var(--status-success,#1A7D56)",
            }}
          >
            På sport
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ background: "rgba(59,130,246,0.10)", color: "#1D4ED8" }}
          >
            Coach varslet
          </span>
        </div>
      </div>

      <FindingBlock label="Driver — launch-justering">
        <b className="font-semibold text-primary">
          Driver launch nedjustert til 12,8°
        </b>{" "}
        — innenfor target (12–14°). Carry +9 m siste 30d. Hold setup som det er.
      </FindingBlock>

      <FindingBlock label="7-jern — apex-trend">
        Apex sunket fra 24 m til 18 m. Bedre vind-tolerant slag.{" "}
        <b className="font-semibold text-primary">Smash 1,38</b> — i target.
      </FindingBlock>

      <FindingBlock label="Wedge — spin-variasjon" warn>
        <b className="font-semibold" style={{ color: "#6F4F18" }}>
          Spin varierer ±1 200 rpm
        </b>{" "}
        mellom slag. Coach foreslår: prøv en annen ball-type for bedre
        konsistens.
      </FindingBlock>

      <div className="border-b border-border px-6 py-4">
        <div className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          Coach-anbefaling
        </div>
        <p className="rounded-md bg-secondary px-3.5 py-3 text-[12px] italic leading-relaxed text-muted-foreground">
          «Behold setup på driver. Prøv ny ball-type (Pro V1x) for spin-kontroll
          på 7-jern og wedge — vi ser på data igjen om 2 uker.»
          <small className="mt-2 block not-italic text-muted-foreground">
            — Anders K., Pro-coach
          </small>
        </p>
      </div>

      <div className="flex flex-col gap-2 px-6 py-4">
        <button className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90">
          Eksporter til Strokes Gained
        </button>
        <button className="inline-flex items-center justify-center rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium hover:bg-secondary">
          Last opp ny TrackMan-økt
        </button>
        <button className="text-left px-3.5 py-2 text-[12px] font-medium text-muted-foreground hover:text-foreground">
          Be om coach-vurdering
        </button>
        <button className="text-left px-3.5 py-2 text-[12px] font-medium text-muted-foreground hover:text-foreground">
          Se alle 8 økter →
        </button>
      </div>
    </aside>
  );
}

function FindingBlock({
  label,
  children,
  warn,
}: {
  label: string;
  children: React.ReactNode;
  warn?: boolean;
}) {
  return (
    <div className="border-b border-border px-6 py-4">
      <div className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`rounded-md border-l-[3px] px-3.5 py-3 text-[12px] leading-relaxed ${
          warn
            ? "border-l-[#B8852A] bg-[rgba(184,133,42,0.06)]"
            : "border-l-primary bg-secondary"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function Dot() {
  return (
    <span
      className="inline-block h-1 w-1 rounded-full"
      style={{ background: "var(--ink-disabled, #C4C0B8)" }}
    />
  );
}
