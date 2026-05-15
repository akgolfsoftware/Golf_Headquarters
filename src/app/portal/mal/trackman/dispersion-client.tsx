"use client";

const SVG_W = 600;
const SVG_H = 420;
const CX = 300;
const CY = 200;
const SCALE = 10;
const CARRY = 162;
const TARGET_R = CARRY * 0.05;
const ACCEPT_R = CARRY * 0.10;
const SEED_INIT = 71;
const N = 80;

function makePrng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function gauss(rand: () => number, mu: number, sigma: number): number {
  const u1 = 1 - rand();
  const u2 = 1 - rand();
  return mu + Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * sigma;
}

type Shot = { cx: number; cy: number; cls: "good" | "acceptable" | "miss" };
type Stats = { inT: number; acc: number; miss: number; meanX: number };

function computeShots(): { shots: Shot[]; stats: Stats } {
  const rand = makePrng(SEED_INIT);
  const shots: Shot[] = [];
  let inT = 0, acc = 0, miss = 0, sumX = 0;

  for (let i = 0; i < N; i++) {
    const x = gauss(rand, 1.8, 5.2);
    const y = gauss(rand, -0.8, 4.0);
    const r = Math.sqrt(x * x + y * y);
    const cls: Shot["cls"] = r < TARGET_R ? "good" : r < ACCEPT_R ? "acceptable" : "miss";
    if (cls === "good") inT++;
    else if (cls === "acceptable") acc++;
    else miss++;
    sumX += x;
    shots.push({
      cx: parseFloat((CX + x * SCALE).toFixed(2)),
      cy: parseFloat((CY - y * SCALE).toFixed(2)),
      cls,
    });
  }
  return { shots, stats: { inT, acc, miss, meanX: sumX / N } };
}

const PRECOMPUTED = computeShots();

export function DispersionClient() {
  const { shots, stats } = PRECOMPUTED;
  const inPct = Math.round((stats.inT / N) * 100);
  const accPct = Math.round((stats.acc / N) * 100);
  const missPct = Math.round((stats.miss / N) * 100);
  const meanXStr = (stats.meanX >= 0 ? "+" : "") + stats.meanX.toFixed(1).replace(".", ",");
  const meanXPx = CX + stats.meanX * SCALE;
  const meanYPx = CY - (-0.8 * SCALE);

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-stretch">
      {/* SVG plot */}
      <div
        className="relative flex-1 overflow-hidden rounded-xl border border-border"
        style={{
          background:
            "radial-gradient(ellipse at 50% 35%, rgba(0,88,64,0.06) 0%, rgba(0,88,64,0.02) 60%, transparent 100%), hsl(var(--background))",
        }}
      >
        <svg
          viewBox={`0 0 ${SVG_W} ${SVG_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="block h-auto w-full"
          aria-label="Dispersion-plot 7-jern"
        >
          {/* Grid lines */}
          {[50, 100, 150, 200, 250, 350, 400, 450, 500, 550].map((x) => (
            <line
              key={`vg${x}`}
              x1={x} y1={40} x2={x} y2={360}
              stroke="hsl(var(--border))" strokeWidth={1}
            />
          ))}
          <line x1={300} y1={40} x2={300} y2={360} stroke="#9C9990" strokeDasharray="3 4" opacity={0.45} strokeWidth={1} />
          {[70, 120, 170, 230, 280, 330].map((y) => (
            <line
              key={`hg${y}`}
              x1={40} y1={y} x2={560} y2={y}
              stroke="hsl(var(--border))" strokeWidth={1}
            />
          ))}
          <line x1={40} y1={200} x2={560} y2={200} stroke="#9C9990" strokeDasharray="3 4" opacity={0.45} strokeWidth={1} />

          {/* 10% acceptable ring */}
          <circle
            cx={CX} cy={CY} r={ACCEPT_R * SCALE}
            fill="none"
            stroke="#B8852A" strokeWidth={1.2}
            strokeDasharray="4 4" opacity={0.55}
          />
          <text x={CX} y={56} textAnchor="middle" fill="#B8852A" fontSize={9.5} fontWeight={700}
            style={{ fontFamily: "var(--font-jetbrains-mono, ui-monospace)", letterSpacing: "0.04em" }}>
            10 % grense · ±{(ACCEPT_R).toFixed(1)} m
          </text>

          {/* 5% target circle */}
          <circle
            cx={CX} cy={CY} r={TARGET_R * SCALE}
            fill="rgba(22,163,74,0.08)"
            stroke="#16A34A" strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <text x={CX} y={126} textAnchor="middle" fill="#16A34A" fontSize={9.5} fontWeight={700}
            style={{ fontFamily: "var(--font-jetbrains-mono, ui-monospace)", letterSpacing: "0.04em" }}>
            5 % mål · ±{TARGET_R.toFixed(1)} m
          </text>

          {/* Confidence ellipse 1σ */}
          <ellipse
            cx={CX + 1.8 * SCALE} cy={CY - (-0.8) * SCALE}
            rx={52} ry={40}
            fill="rgba(0,88,64,0.07)"
            stroke="hsl(var(--primary))" strokeWidth={1.5}
            strokeDasharray="2 3"
          />

          {/* Target cross + dot */}
          <line x1={289} y1={CY} x2={311} y2={CY} stroke="hsl(var(--primary))" strokeWidth={1.5} />
          <line x1={CX} y1={189} x2={CX} y2={211} stroke="hsl(var(--primary))" strokeWidth={1.5} />
          <circle cx={CX} cy={CY} r={3.5} fill="hsl(var(--primary))" />

          {/* Shot dots — deterministically seeded, safe to render on both server and client */}
          {shots.map((s, i) => (
            <circle
              key={i}
              cx={s.cx} cy={s.cy} r={3.6}
              stroke="rgba(255,255,255,0.7)" strokeWidth={0.8}
              fill={
                s.cls === "good"
                  ? "hsl(var(--primary))"
                  : s.cls === "acceptable"
                  ? "#B8852A"
                  : "hsl(var(--destructive))"
              }
              opacity={s.cls === "miss" ? 0.85 : 1}
            />
          ))}

          {/* Mean dot */}
          <circle
            cx={meanXPx} cy={meanYPx} r={5}
            fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth={2}
          />

          {/* X-axis labels */}
          {([-25, -20, -15, -10, -5] as const).map((v, i) => (
            <text key={v} x={50 + i * 50} y={378} textAnchor="middle" fill="hsl(var(--muted-foreground))"
              fontSize={9.5} style={{ fontFamily: "var(--font-jetbrains-mono, ui-monospace)" }}>
              {v}
            </text>
          ))}
          <text x={300} y={378} textAnchor="middle" fill="hsl(var(--primary))" fontSize={9.5} fontWeight={700}
            style={{ fontFamily: "var(--font-jetbrains-mono, ui-monospace)" }}>
            FLAGG
          </text>
          {([5, 10, 15, 20] as const).map((v, i) => (
            <text key={v} x={350 + i * 50} y={378} textAnchor="middle" fill="hsl(var(--muted-foreground))"
              fontSize={9.5} style={{ fontFamily: "var(--font-jetbrains-mono, ui-monospace)" }}>
              +{v}
            </text>
          ))}
          <text x={550} y={378} textAnchor="middle" fill="hsl(var(--muted-foreground))"
            fontSize={9.5} style={{ fontFamily: "var(--font-jetbrains-mono, ui-monospace)" }}>
            +25 m
          </text>

          {/* Y-axis labels */}
          {([{ y: 74, l: "+15" }, { y: 124, l: "+10" }, { y: 174, l: "+5" }, { y: 234, l: "−5" }, { y: 284, l: "−10" }, { y: 334, l: "−15 m" }]).map(({ y, l }) => (
            <text key={y} x={32} y={y} textAnchor="end" fill="hsl(var(--muted-foreground))"
              fontSize={9.5} style={{ fontFamily: "var(--font-jetbrains-mono, ui-monospace)" }}>
              {l}
            </text>
          ))}
          <text x={32} y={204} textAnchor="end" fill="hsl(var(--primary))" fontSize={9.5} fontWeight={700}
            style={{ fontFamily: "var(--font-jetbrains-mono, ui-monospace)" }}>
            FLAGG
          </text>

          {/* Axis direction labels */}
          <text x={14} y={200} textAnchor="middle" fill="hsl(var(--muted-foreground))"
            fontSize={10} fontWeight={600}
            style={{
              fontFamily: "var(--font-jetbrains-mono, ui-monospace)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              transform: "rotate(-90deg)",
              transformOrigin: "14px 200px",
            }}>
            CARRY-AVVIK · m
          </text>
          <text x={CX} y={402} textAnchor="middle" fill="hsl(var(--muted-foreground))"
            fontSize={10} fontWeight={600}
            style={{ fontFamily: "var(--font-jetbrains-mono, ui-monospace)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            SIDE-AVVIK · m
          </text>
        </svg>
      </div>

      {/* Stats panel */}
      <div className="flex flex-col gap-2 sm:w-44">
        {/* Innenfor 5% */}
        <div className="rounded-xl border p-3" style={{ background: "rgba(22,163,74,0.07)", borderColor: "rgba(22,163,74,0.30)" }}>
          <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Innenfor 5 % mål
          </div>
          <div className="mt-1 font-mono text-xl font-medium tabular-nums leading-tight text-green-600">
            {stats.inT}<small className="text-[12px] font-normal text-muted-foreground">/{N}</small>
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-muted-foreground tabular-nums">
            {inPct} % · ±{TARGET_R.toFixed(1)} m radius
          </div>
        </div>

        {/* Akseptabelt */}
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Akseptabelt (5–10 %)
          </div>
          <div className="mt-1 font-mono text-xl font-medium tabular-nums leading-tight text-foreground">
            {stats.acc}<small className="text-[12px] font-normal text-muted-foreground">/{N}</small>
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-muted-foreground tabular-nums">
            {accPct} % · {TARGET_R.toFixed(1)}–{ACCEPT_R.toFixed(1)} m
          </div>
        </div>

        {/* Utenfor */}
        <div className="rounded-xl border p-3" style={{ background: "rgba(184,133,42,0.07)", borderColor: "rgba(184,133,42,0.30)" }}>
          <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Utenfor mål
          </div>
          <div className="mt-1 font-mono text-xl font-medium tabular-nums leading-tight text-foreground">
            {stats.miss}<small className="text-[12px] font-normal text-muted-foreground">/{N}</small>
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-muted-foreground tabular-nums">
            {missPct} % · &gt; {ACCEPT_R.toFixed(1)} m
          </div>
        </div>

        {/* Snitt-bom */}
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Snitt-bom
          </div>
          <div className="mt-1 font-mono text-xl font-medium tabular-nums leading-tight text-foreground">
            {meanXStr}<small className="text-[12px] font-normal text-muted-foreground"> m</small>
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
            σ side ±5,4 · σ dist ±4,2
          </div>
        </div>
      </div>
    </div>
  );
}
