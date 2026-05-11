/**
 * PlayerHQ — Talent · Mitt nivå (Markus' egen syn)
 * Bygd fra spec talent-design/uploads/04-mitt-niva.md
 * URL: /talent-mitt-niva-demo
 *
 * Perspektiv: spillerens eget syn (jeg / mitt). Ingen sidebar/rail.
 */

import { ArrowLeft, Check, Minus, TriangleAlert } from "lucide-react";

type LadderTone = "primary" | "info" | "accent";

type Ladder = {
  steps: string[];
  currentIndex: number;
  tone: LadderTone;
};

type Benchmark = {
  label: string;
  detail: string;
  you: string;
  cohort: string;
  pro: string;
  status: "success" | "warning" | "danger";
  statusText: string;
};

const NGF: Ladder = {
  steps: ["Bredde", "Klubb", "Krets", "Elite", "Topp"],
  currentIndex: 3,
  tone: "primary",
};

const NIVAA: Ladder = {
  steps: ["Nivå 1", "Nivå 2", "Nivå 3", "Nivå 4", "Nivå 5", "Nivå 6"],
  currentIndex: 2,
  tone: "info",
};

const NCAA: Ladder = {
  steps: ["NAIA", "D-III", "D-II", "D-I"],
  currentIndex: 2,
  tone: "accent",
};

const BENCHMARKS: Benchmark[] = [
  {
    label: "Scoring-snitt",
    detail: "siste 10 runder",
    you: "71,4",
    cohort: "73,8",
    pro: "70,2",
    status: "success",
    statusText: "Sterkt",
  },
  {
    label: "Driving distance",
    detail: "Carry + roll, snitt",
    you: "264 m",
    cohort: "248 m",
    pro: "278 m",
    status: "success",
    statusText: "Sterkt",
  },
  {
    label: "SG approach",
    detail: "100–125 m",
    you: "−0,18",
    cohort: "0,00",
    pro: "+0,40",
    status: "warning",
    statusText: "Svakt",
  },
  {
    label: "SG putting",
    detail: "vs scratch, siste 10 r.",
    you: "+0,32",
    cohort: "+0,05",
    pro: "+0,28",
    status: "success",
    statusText: "Sterkt",
  },
  {
    label: "GIR",
    detail: "greens in regulation",
    you: "64 %",
    cohort: "58 %",
    pro: "72 %",
    status: "success",
    statusText: "På sporet",
  },
  {
    label: "Up & down",
    detail: "innen 30 m",
    you: "48 %",
    cohort: "55 %",
    pro: "64 %",
    status: "danger",
    statusText: "Mangler",
  },
  {
    label: "Clubhead speed",
    detail: "driver, snitt",
    you: "166 km/t",
    cohort: "162 km/t",
    pro: "176 km/t",
    status: "warning",
    statusText: "Utvikle",
  },
];

// 41 punkter bell-kurve, peaker rundt indeks 24-27 for "elite-skew"
function bellCurve(): number[] {
  const pts: number[] = [];
  for (let i = 0; i < 41; i++) {
    const x = (i - 22) / 7;
    const y = Math.exp(-(x * x) / 2);
    pts.push(y);
  }
  return pts;
}

export default function TalentMittNivaDemo() {
  const curve = bellCurve();
  const maxY = Math.max(...curve);
  const markerIndex = 33; // 82. percentil-posisjon

  // Areal-sti for SVG (240px høyde, 800px bredde)
  const W = 800;
  const H = 180;
  const stepX = W / (curve.length - 1);
  const points = curve.map((y, i) => ({
    x: i * stepX,
    y: H - (y / maxY) * (H - 16) - 4,
  }));
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");
  const areaD = `${pathD} L${W},${H} L0,${H} Z`;

  const markerX = markerIndex * stepX;
  const markerY = points[markerIndex].y;

  // Percentile-band linjer
  const p25X = 16 * stepX;
  const p50X = 22 * stepX;
  const p75X = 28 * stepX;
  const p90X = 35 * stepX;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1200px] px-8 py-8">
        {/* PageHeader */}
        <header className="mb-6 flex items-start justify-between gap-6">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Personlig nivåmåling
            </span>
            <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
              <em className="italic text-primary">Hvor står</em> jeg?
            </h1>
            <p className="mt-1.5 max-w-[520px] text-[13px] leading-[1.5] text-muted-foreground">
              Mitt nivå målt mot J19-kohorten i Norge. Tre stigemålere viser hvor langt jeg
              er kommet på NGF-klassifiseringen, det interne utviklingsnivået og NCAA-skalaen.
            </p>
          </div>
          <button className="inline-flex items-center gap-1.5 self-start rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium hover:bg-secondary">
            <ArrowLeft size={14} strokeWidth={1.5} />
            Tilbake
          </button>
        </header>

        {/* FilterRow */}
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
          <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Sammenligning
          </span>
          <Chip active>Mot J19-kohort</Chip>
          <Chip>Mot kjønnskohort</Chip>
          <Chip>Mot Mulligan-spillere</Chip>
          <span className="ml-auto font-mono text-[11px] text-muted-foreground">
            kohort: 412 spillere · oppdatert 11.05.2026 · 06:00
          </span>
        </div>

        {/* Hero-card percentil + density-curve */}
        <section className="mb-6 rounded-2xl border border-border bg-card p-8">
          <div className="mb-6 flex items-end justify-between gap-6">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Min plassering i kohorten
              </div>
              <div className="mt-2 font-display text-[72px] font-medium leading-none tracking-tight">
                <em className="italic text-primary">82.</em>{" "}
                <span className="text-foreground">percentil</span>
              </div>
              <p className="mt-3 max-w-[520px] text-[14px] leading-[1.5] text-foreground">
                Jeg er bedre enn <b className="font-semibold">82 %</b> av spillerne i
                J19-kohorten min. Talent-score 71,4 av 100.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-secondary px-4 py-3">
              <div className="font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
                Min talent-score
              </div>
              <div className="mt-1.5 font-mono text-[28px] font-medium leading-none tabular-nums">
                71,4
              </div>
              <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                kohort-snitt 58,3 · pro-cutoff 84,0
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-[var(--surface-alt,#F1EEE5)] p-4">
            <svg
              viewBox={`0 0 ${W} ${H + 24}`}
              preserveAspectRatio="none"
              className="block h-[200px] w-full overflow-visible"
            >
              {/* bands */}
              {[
                { x: p25X, label: "p25" },
                { x: p50X, label: "p50" },
                { x: p75X, label: "p75" },
                { x: p90X, label: "p90" },
              ].map((b) => (
                <g key={b.label}>
                  <line
                    x1={b.x}
                    y1={0}
                    x2={b.x}
                    y2={H}
                    stroke="#9D9C95"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    opacity={0.6}
                  />
                  <text
                    x={b.x + 4}
                    y={12}
                    className="fill-muted-foreground font-mono text-[9px]"
                  >
                    {b.label}
                  </text>
                </g>
              ))}

              {/* area + line */}
              <path d={areaD} fill="rgba(0,88,64,0.10)" />
              <path
                d={pathD}
                fill="none"
                stroke="#005840"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* marker */}
              <line
                x1={markerX}
                y1={0}
                x2={markerX}
                y2={H}
                stroke="#005840"
                strokeWidth="2"
              />
              <circle
                cx={markerX}
                cy={markerY}
                r="7"
                fill="#FFFFFF"
                stroke="#005840"
                strokeWidth="2.5"
              />
              <rect
                x={markerX - 46}
                y={markerY - 30}
                width="92"
                height="22"
                rx="4"
                fill="#005840"
              />
              <text
                x={markerX}
                y={markerY - 15}
                textAnchor="middle"
                className="fill-white font-mono text-[10px] font-semibold"
              >
                JEG · 71,4
              </text>

              {/* Bottom labels */}
              <text x={0} y={H + 18} className="fill-muted-foreground font-mono text-[9px]">
                svakeste
              </text>
              <text
                x={W}
                y={H + 18}
                textAnchor="end"
                className="fill-muted-foreground font-mono text-[9px]"
              >
                sterkeste
              </text>
            </svg>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-muted-foreground">
            <span>
              Kohort: <b className="font-semibold text-foreground">J19 norske gutter</b> ·
              412 spillere · datakilde GolfBox + NGF
            </span>
            <span>fordeling i talent-score 0–100</span>
          </div>
        </section>

        {/* Two ladders side-by-side */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <LadderCard
            eyebrow="NGF-klassifisering"
            italicTitle="Elite"
            titleSuffix="-nivå"
            descLead="Jeg er klassifisert som"
            ladder={NGF}
            currentLabel="Du her"
            nextHint="−1,2 slag → Topp"
          />
          <LadderCard
            eyebrow="Internt utviklingsnivå"
            italicTitle="Nivå 3"
            titleSuffix=" · etablert"
            descLead="Jeg er på"
            ladder={NIVAA}
            currentLabel="Du her"
            nextHint="Bestått 12/20 tester → Nivå 4"
          />
        </div>

        {/* NCAA-readiness */}
        <section className="mb-6 rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-start justify-between gap-6">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                NCAA-readiness · ambisjon
              </div>
              <h3 className="mt-2 font-display text-[20px] font-medium leading-snug">
                <em className="italic">D-II</em> nå · <em className="italic text-primary">D-I</em>{" "}
                om 18 måneder
              </h3>
              <p className="mt-1.5 text-[12px] leading-[1.5] text-muted-foreground">
                Basert på min scoring-trend og kohort-percentil. Pro-mål for D-I er
                snittscore under 71,5.
              </p>
            </div>
            <span className="rounded-full bg-accent px-3 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-accent-foreground">
              Realistisk D-I 2027/28
            </span>
          </div>

          <div className="mb-6">
            <LadderRow ladder={NCAA} currentLabel="Du her" />
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Lane label="Score-equiv nå" value="71,4" meta="snitt siste 10 r." tone="success" />
            <Lane label="D-I cutoff" value="71,5" meta="trenger −0,1 slag" tone="warning" />
            <Lane label="D-II cutoff" value="73,5" meta="passert · −2,1 slag margin" tone="success" />
            <Lane label="NAIA cutoff" value="75,8" meta="passert · −4,4 slag margin" tone="success" />
          </div>
        </section>

        {/* Benchmark-tabell */}
        <section className="mb-8 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                7 nøkkelmetrics · meg vs kohort vs pro-mål
              </div>
              <h3 className="mt-1 font-display text-[18px] font-medium leading-snug">
                Hvor jeg står på hver del av spillet
              </h3>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground">
              data fra Trackman + GolfBox · 04.05 – 11.05.2026
            </span>
          </div>

          {/* Header row */}
          <div className="grid grid-cols-[1.7fr_70px_80px_80px_120px] gap-3 border-b border-border px-6 py-3 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            <span>Metric</span>
            <span className="text-right">Jeg</span>
            <span className="text-right">Kohort</span>
            <span className="text-right">Pro-mål</span>
            <span className="text-right">Status</span>
          </div>

          {BENCHMARKS.map((b, i) => (
            <ContentRow key={b.label} row={b} last={i === BENCHMARKS.length - 1} />
          ))}
        </section>

        {/* Agent-tilbakemelding */}
        <section className="rounded-lg border border-primary/30 bg-primary/5 p-6">
          <div className="flex items-start gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground font-display text-[14px] font-semibold">
              A
            </div>
            <div className="flex-1">
              <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
                Agent-tilbakemelding · 11.05.2026 · 06:14
              </div>
              <p className="mt-2 max-w-[640px] text-[14px] leading-[1.55] text-foreground">
                Du ligger sterkt på <b className="font-semibold">scoring</b> og{" "}
                <b className="font-semibold">putting</b>, men taper terreng på{" "}
                <em className="italic">approach 100–125 m</em> og <em className="italic">up &amp; down</em>.
                Hvis du lukker approach-gapet til 0,00 SG kommer du forbi 90. percentil og
                er innenfor D-I-vurdering.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-card px-3 py-1 font-mono text-[10px] font-semibold text-foreground">
                  Neste milepæl: 90. percentil
                </span>
                <span className="rounded-full bg-card px-3 py-1 font-mono text-[10px] font-semibold text-foreground">
                  Trenger: −0,4 SG approach
                </span>
                <span className="rounded-full bg-card px-3 py-1 font-mono text-[10px] font-semibold text-foreground">
                  Estimert: 6–8 uker
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Chip({
  active = false,
  children,
}: {
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-muted-foreground hover:bg-secondary/80"
      }`}
    >
      {children}
    </button>
  );
}

function LadderCard({
  eyebrow,
  italicTitle,
  titleSuffix,
  descLead,
  ladder,
  currentLabel,
  nextHint,
}: {
  eyebrow: string;
  italicTitle: string;
  titleSuffix: string;
  descLead: string;
  ladder: Ladder;
  currentLabel: string;
  nextHint: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {eyebrow}
      </div>
      <h3 className="mt-2 font-display text-[24px] font-medium leading-snug">
        {descLead} <em className="italic text-primary">{italicTitle}</em>
        {titleSuffix}
      </h3>
      <div className="mt-5">
        <LadderRow ladder={ladder} currentLabel={currentLabel} />
      </div>
      <div className="mt-4 flex items-center justify-between rounded-sm bg-[var(--surface-alt,#F1EEE5)] px-4 py-3 font-mono text-[11px]">
        <span className="text-muted-foreground">Neste trinn:</span>
        <span className="font-semibold text-foreground">{nextHint}</span>
      </div>
    </section>
  );
}

function LadderRow({
  ladder,
  currentLabel,
}: {
  ladder: Ladder;
  currentLabel: string;
}) {
  const tone = ladder.tone;
  return (
    <div className="flex items-stretch gap-1.5">
      {ladder.steps.map((step, i) => {
        const passed = i < ladder.currentIndex;
        const current = i === ladder.currentIndex;
        const bg = passed
          ? tone === "primary"
            ? "bg-primary text-primary-foreground"
            : tone === "info"
              ? "bg-[#1A7D56] text-white"
              : "bg-accent text-accent-foreground"
          : current
            ? tone === "primary"
              ? "bg-primary text-primary-foreground ring-2 ring-primary/30 ring-offset-2 ring-offset-card"
              : tone === "info"
                ? "bg-[#1A7D56] text-white ring-2 ring-[#1A7D56]/30 ring-offset-2 ring-offset-card"
                : "bg-accent text-accent-foreground ring-2 ring-accent/40 ring-offset-2 ring-offset-card"
            : "bg-secondary text-muted-foreground";
        return (
          <div
            key={step}
            className={`flex-1 rounded-md px-3 py-3 text-center transition-colors ${bg}`}
          >
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em]">
              {step}
            </div>
            {current && (
              <div className="mt-1.5 font-mono text-[9px] font-medium tracking-wide opacity-90">
                {currentLabel}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Lane({
  label,
  value,
  meta,
  tone,
}: {
  label: string;
  value: string;
  meta: string;
  tone: "success" | "warning";
}) {
  const valueTone =
    tone === "success" ? "text-[#1A7D56]" : "text-[#B8852A]";
  return (
    <div className="rounded-md bg-secondary p-4">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-2 font-mono text-[22px] font-medium tabular-nums leading-none ${valueTone}`}
      >
        {value}
      </div>
      <div className="mt-1.5 font-mono text-[10px] text-muted-foreground">{meta}</div>
    </div>
  );
}

function ContentRow({ row, last }: { row: Benchmark; last: boolean }) {
  const valueTone =
    row.status === "success"
      ? "text-[#1A7D56]"
      : row.status === "warning"
        ? "text-[#B8852A]"
        : "text-[#A32D2D]";

  return (
    <div
      className={`grid grid-cols-[1.7fr_70px_80px_80px_120px] items-center gap-3 px-6 py-3 ${
        last ? "" : "border-b border-border"
      }`}
    >
      <div>
        <div className="text-[13px] font-semibold leading-tight">{row.label}</div>
        <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
          {row.detail}
        </div>
      </div>
      <span className={`text-right font-mono text-[14px] font-semibold tabular-nums ${valueTone}`}>
        {row.you}
      </span>
      <span className="text-right font-mono text-[13px] tabular-nums text-muted-foreground">
        {row.cohort}
      </span>
      <span className="text-right font-mono text-[13px] tabular-nums text-foreground">
        {row.pro}
      </span>
      <div className="flex justify-end">
        <StatusPill status={row.status} text={row.statusText} />
      </div>
    </div>
  );
}

function StatusPill({
  status,
  text,
}: {
  status: "success" | "warning" | "danger";
  text: string;
}) {
  const styles =
    status === "success"
      ? "bg-[#E5F1EA] text-[#1A7D56]"
      : status === "warning"
        ? "bg-[#FFF0D6] text-[#B8852A]"
        : "bg-[#F8E2E2] text-[#A32D2D]";
  const Icon =
    status === "success"
      ? Check
      : status === "warning"
        ? Minus
        : TriangleAlert;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] font-semibold ${styles}`}
    >
      <Icon size={12} strokeWidth={1.5} />
      {text}
    </span>
  );
}
