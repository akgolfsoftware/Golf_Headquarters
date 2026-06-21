"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, Ruler, CircleDot, Circle, Footprints, ArrowUpRight } from "lucide-react";
import * as C from "@/lib/putt-core";

// ─── Local data ──────────────────────────────────────────────────────────────
const FOOT = ["1,3 fot","5 fot","6,6 fot","8,2 fot","9,8 fot","13,1 fot","16,4 fot","19,7 fot"];
const GMAX = 125;
const GRADES = [
  { l: "Bratt ned", pct: 2, dir: +1 },
  { l: "Ned",       pct: 1, dir: +1 },
  { l: "Flatt",     pct: 0, dir:  0 },
  { l: "Opp",       pct: 1, dir: -1 },
  { l: "Bratt opp", pct: 2, dir: -1 },
] as const;
const SPEED_FILL = ["rgba(0,88,64,0.38)","rgba(0,88,64,0.60)","rgba(0,88,64,0.86)"];

function rateFor(stimp: number) { return stimp >= 11 ? 2.0 : 1.5; }

function heat(v: number) {
  const t = Math.pow(v / GMAX, 0.42);
  const a = 0.05 + t * 0.82;
  return { bg: `rgba(0,88,64,${a.toFixed(3)})`, fg: a > 0.46 ? "#FAFAF7" : "currentColor" };
}

// ─── Shared primitives ───────────────────────────────────────────────────────
function CtrlLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground block mb-2">
      {children}
    </span>
  );
}

function Seg({ items, active, onPick }: { items: string[]; active: number; onPick: (i: number) => void }) {
  return (
    <div className="inline-flex flex-wrap gap-0.5 bg-secondary p-0.5 rounded-md">
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => onPick(i)}
          className={`font-mono text-[12px] font-bold px-3 py-2 rounded-sm transition-colors tabular-nums whitespace-nowrap ${
            i === active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function VHead({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="flex items-end gap-4 mb-5 flex-wrap">
      <span className="font-mono text-[11px] font-extrabold tracking-[0.12em] text-primary-foreground bg-primary px-2.5 py-1.5 rounded-sm whitespace-nowrap">
        {num}
      </span>
      <span className="font-display font-bold text-2xl tracking-snug">{title}</span>
      <span className="ml-auto font-mono text-[11px] text-muted-foreground text-right leading-relaxed max-w-xs hidden md:block">
        {desc}
      </span>
    </div>
  );
}

// ─── Variant 1: Komplett matrise ─────────────────────────────────────────────
function MatriksView() {
  return (
    <section className="mt-14">
      <VHead num="VARIANT 01" title="Komplett matrise" desc="Hele veggkartet · AgencyOS-referanse. Fyll koder break-mengde." />
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {C.LEN.map((L, li) => (
            <LenBlock key={li} L={L} foot={FOOT[li]} />
          ))}
          <RefCard />
        </div>
        <HeatLegend />
      </div>
    </section>
  );
}

function LenBlock({ L, foot }: { L: C.LenEntry; foot: string }) {
  return (
    <div className="border border-border rounded-md overflow-hidden bg-card">
      <div className="flex items-baseline gap-2 px-3 py-2.5 bg-secondary border-b-[3px] border-accent">
        <span className="font-display font-bold text-[17px] tracking-snug">{L.m}</span>
        <span className="font-mono text-[10px] font-semibold text-muted-foreground">{foot}</span>
        <span className="ml-auto font-mono text-[9px] font-bold tracking-[0.10em] uppercase text-muted-foreground">stimp →</span>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "50px repeat(3, 1fr)", gap: "1px", background: "hsl(var(--border))" }}>
        <div className="bg-secondary flex items-center justify-center font-mono text-[8px] font-bold tracking-[0.06em] uppercase text-muted-foreground py-1.5">cm</div>
        {C.SPEEDS.map(s => (
          <div key={s} className="bg-secondary text-center font-mono text-[12px] font-extrabold py-1.5 tabular-nums">{s}</div>
        ))}
        {L.grid.map((row, si) => (
          <>
            <div key={`rh-${si}`} className="bg-[hsl(var(--secondary)/0.6)] flex items-center justify-end pr-2 font-mono text-[11px] font-bold py-1.5">
              {C.SLOPES[si]}
            </div>
            {row.map((v, vi) => {
              const h = heat(v);
              return (
                <div
                  key={`v-${si}-${vi}`}
                  className="text-center font-mono text-[12.5px] font-bold py-1.5 tabular-nums"
                  style={{ background: h.bg, color: h.fg }}
                >
                  {v}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

function RefCard() {
  return (
    <div className="border border-border rounded-md overflow-hidden bg-card flex flex-col">
      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-primary border-b-[3px] border-accent">
        <Ruler className="h-3.5 w-3.5 text-accent" strokeWidth={2} />
        <span className="font-display font-bold text-[15px] text-[#FAFAF7] tracking-snug">Referanse</span>
      </div>
      <div className="p-3.5 flex flex-col gap-3 flex-1">
        <RefRow icon={<CircleDot className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />} label="Hullkant" value="5,4 cm" />
        <RefRow icon={<Circle className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />} label="Ball" value="4,0 cm" />
        <RefRow icon={<Footprints className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />} label="Fot (str. 42)" value="30 cm" />
        <div className="h-px bg-border my-1" />
        <RefNote heading="Raske greener · stimp 11–13" body={<>1 % nedover/oppover gir ca. <strong className="text-foreground font-bold">±2 på stimpen</strong>.</>} />
        <RefNote heading="Trege greener · stimp 8–10" body={<>2 % nedover/oppover gir ca. <strong className="text-foreground font-bold">±3 på stimpen</strong>.</>} />
      </div>
    </div>
  );
}

function RefRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      {icon}
      <span className="text-[12.5px] text-foreground">{label}</span>
      <span className="ml-auto font-mono text-[13px] font-extrabold tabular-nums">{value}</span>
    </div>
  );
}

function RefNote({ heading, body }: { heading: string; body: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[9px] font-extrabold tracking-[0.08em] uppercase text-primary">{heading}</span>
      <span className="text-[12px] leading-snug text-muted-foreground">{body}</span>
    </div>
  );
}

function HeatLegend() {
  const stops = [2, 8, 20, 40, 70, 110];
  return (
    <div className="flex items-center gap-3.5 mt-5 pt-4 border-t border-border flex-wrap">
      <span className="font-mono text-[9px] font-extrabold tracking-[0.10em] uppercase text-muted-foreground">Fyll = break</span>
      <span className="font-mono text-[10px] font-bold text-muted-foreground">lite</span>
      <div className="flex h-3 w-[200px] rounded-full overflow-hidden border border-border">
        {stops.map(v => (
          <span key={v} className="flex-1" style={{ background: heat(v).bg }} />
        ))}
      </div>
      <span className="font-mono text-[10px] font-bold text-muted-foreground">mye</span>
      <span className="ml-auto font-mono text-[10px] text-muted-foreground hidden sm:block">
        Skala er global — 6 m brekker dramatisk mer enn 1 m.
      </span>
    </div>
  );
}

// ─── Variant 2: Break-kalkulator ─────────────────────────────────────────────
function KalkulatorView() {
  const [len, setLen] = useState(4);
  const [slope, setSlope] = useState(3);
  const [speedIdx, setSpeedIdx] = useState(1);
  const [gradeIdx, setGradeIdx] = useState(2);

  const base = C.SPEEDS[speedIdx];
  const g = GRADES[gradeIdx];
  const flat = C.LEN[len].grid[slope][speedIdx];
  const effStimp = base + g.dir * rateFor(base) * g.pct;
  const adj = g.dir === 0 ? flat : Math.round(C.breakAtStimp(len, slope, effStimp));
  const dCm = adj - flat;
  const dPct = flat ? Math.round((dCm / flat) * 100) : 0;

  return (
    <section className="mt-14">
      <VHead num="VARIANT 02" title="Break-kalkulator" desc="PlayerHQ-verktøy · velg situasjonen — inkl. opp/ned-fart — få ett tall og siktebildet." />
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-7 items-stretch">
          {/* Controls */}
          <div className="flex flex-col gap-5">
            <div><CtrlLabel>Lengde</CtrlLabel><Seg items={C.LEN.map(l => l.m)} active={len} onPick={setLen} /></div>
            <div><CtrlLabel>Fall</CtrlLabel><Seg items={C.SLOPES} active={slope} onPick={setSlope} /></div>
            <div><CtrlLabel>Greenhastighet · stimp</CtrlLabel><Seg items={C.SPEEDS.map(String)} active={speedIdx} onPick={setSpeedIdx} /></div>
            <div><CtrlLabel>Lengdehelning · opp / ned</CtrlLabel><Seg items={GRADES.map(g => g.l)} active={gradeIdx} onPick={setGradeIdx} /></div>
            <AimDiagram lenCm={C.LEN[len].cm} breakCm={adj} />
          </div>

          {/* Answer panel */}
          <div className="bg-primary rounded-xl p-6 flex flex-col relative overflow-hidden">
            <span className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-accent">SIKT UTENFOR HULLET</span>
            <div className="font-mono font-bold leading-[0.9] tracking-[-0.04em] text-[88px] text-[#FAFAF7] tabular-nums mt-2">
              {adj}<span className="text-[30px] font-semibold text-accent">&#8239;cm</span>
            </div>
            <DeltaBadge dCm={dCm} dPct={dPct} dir={g.dir} />
            <div className="font-mono text-[13px] font-bold text-[rgba(245,250,238,0.82)] tracking-[0.02em] mt-3">
              {C.LEN[len].m} · {C.SLOPES[slope]} fall · stimp {base}{g.dir !== 0 ? ` · ${g.dir > 0 ? "ned" : "opp"} ${C.nb(g.pct)} %` : ""}
            </div>
            <div className="flex items-center gap-1.5 text-accent font-mono text-[11px] font-bold tracking-[0.04em] mt-2">
              <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
              på høysiden
            </div>
            <EffText base={base} g={g} effStimp={effStimp} />
            <div className="mt-auto pt-5 flex gap-6">
              <ConvBlock n={C.comma1(adj / C.BALL_CM)} label="ballbredder" />
              <ConvBlock n={C.comma1(adj / C.HOLE_CM)} label="hullbredder" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DeltaBadge({ dCm, dPct, dir }: { dCm: number; dPct: number; dir: number }) {
  if (dir === 0) {
    return (
      <div className="mt-3 inline-flex items-center gap-1.5 h-7 px-3 rounded-full font-mono text-[12px] font-extrabold tracking-[0.02em] bg-white/10 text-[rgba(245,250,238,0.7)] self-start">
        <Minus className="h-3.5 w-3.5" strokeWidth={2.5} />flat putt · ingen fart-justering
      </div>
    );
  }
  if (dCm >= 0) {
    return (
      <div className="mt-3 inline-flex items-center gap-1.5 h-7 px-3 rounded-full font-mono text-[12px] font-extrabold tracking-[0.02em] bg-accent text-accent-foreground self-start">
        <TrendingUp className="h-3.5 w-3.5" strokeWidth={2.5} />+{dCm} cm · +{dPct} % vs flatt
      </div>
    );
  }
  return (
    <div className="mt-3 inline-flex items-center gap-1.5 h-7 px-3 rounded-full font-mono text-[12px] font-extrabold tracking-[0.02em] bg-white/14 text-[#FAFAF7] self-start">
      <TrendingDown className="h-3.5 w-3.5" strokeWidth={2.5} />{dCm} cm · {dPct} % vs flatt
    </div>
  );
}

function EffText({ base, g, effStimp }: { base: number; g: typeof GRADES[number]; effStimp: number }) {
  if (g.dir === 0) {
    return (
      <p className="mt-3 font-mono text-[11px] font-semibold leading-relaxed text-[rgba(245,250,238,0.62)] tracking-[0.01em]">
        Flat green spiller på oppgitt fart — stimp <strong className="text-accent font-extrabold">{base}</strong>.
      </p>
    );
  }
  const dirWord = g.dir > 0 ? "Nedover gjør greenen raskere" : "Oppover gjør greenen tregere";
  const ruleText = base >= 11 ? "1 % ≈ ±2" : "2 % ≈ ±3";
  return (
    <p className="mt-3 font-mono text-[11px] font-semibold leading-relaxed text-[rgba(245,250,238,0.62)] tracking-[0.01em]">
      {dirWord}: spiller som stimp <strong className="text-accent font-extrabold">{C.comma1(effStimp)}</strong>. ({ruleText} på stimpen.)
    </p>
  );
}

function ConvBlock({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[22px] font-extrabold text-[#FAFAF7] tabular-nums leading-none">{n}</span>
      <span className="font-mono text-[9px] font-bold tracking-[0.08em] uppercase text-[rgba(245,250,238,0.6)]">{label}</span>
    </div>
  );
}

function AimDiagram({ lenCm, breakCm }: { lenCm: number; breakCm: number }) {
  const W = 360, H = 300, padY = 38;
  const ballY = H - padY, holeY = padY, cx = 215;
  const pxPerCm = (ballY - holeY) / lenCm;
  const rawBreakPx = breakCm * pxPerCm;
  const breakPx = Math.max(6, Math.min(rawBreakPx, 150));
  const holeX = cx - breakPx;

  return (
    <div>
      <CtrlLabel>Siktebilde</CtrlLabel>
      <div className="border border-border rounded-md bg-[hsl(var(--secondary)/0.4)] p-3 flex justify-center">
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Siktebilde" className="block w-full max-w-[320px] h-auto">
          <line x1={cx} y1={ballY} x2={holeX} y2={holeY} stroke="var(--border)" strokeWidth="2" strokeDasharray="2 5" />
          <line x1={cx} y1={holeY} x2={holeX} y2={holeY} stroke="currentColor" strokeOpacity="0.3" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={cx} y1={ballY} x2={cx} y2={holeY} stroke="hsl(var(--accent))" strokeWidth="2.5" strokeDasharray="6 4" strokeLinecap="round" />
          <path d={`M ${cx} ${ballY} Q ${cx} ${holeY} ${holeX} ${holeY}`} fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx={holeX} cy={holeY} r="10" fill="none" stroke="var(--foreground)" strokeWidth="2" />
          <circle cx={holeX} cy={holeY} r="3" fill="var(--foreground)" />
          <circle cx={cx} cy={holeY} r="6" fill="hsl(var(--accent))" stroke="hsl(var(--primary))" strokeWidth="1.5" />
          <circle cx={cx} cy={ballY} r="5" fill="hsl(var(--primary))" />
          <text x={(cx + holeX) / 2} y={holeY - 10} textAnchor="middle" fontSize="12" fontWeight="800" fill="currentColor" fontFamily="JetBrains Mono, monospace">{breakCm} cm</text>
          <text x={cx} y={ballY + 20} textAnchor="middle" fontSize="10" fontWeight="700" fill="hsl(var(--muted-foreground))" fontFamily="JetBrains Mono, monospace">BALL</text>
          <text x={holeX} y={holeY + 24} textAnchor="middle" fontSize="10" fontWeight="700" fill="hsl(var(--muted-foreground))" fontFamily="JetBrains Mono, monospace">HULL</text>
          <text x={cx} y={holeY - 26} textAnchor="middle" fontSize="9" fontWeight="700" fill="hsl(var(--primary))" fontFamily="JetBrains Mono, monospace">SIKT</text>
        </svg>
      </div>
      <p className="mt-2 font-mono text-[10px] text-muted-foreground text-center tracking-[0.02em]">
        Sikt {breakCm} cm til høyre for hullet — la putten falle inn fra høysiden.
      </p>
    </div>
  );
}

// ─── Variant 3: Hastighets-sammenligning ─────────────────────────────────────
function SammenligningView() {
  const [len, setLen] = useState(4);
  const L = C.LEN[len];
  const localMax = Math.max(...L.grid.flat());
  const slow = L.grid[3][0], fast = L.grid[3][2];
  const speedPct = Math.round((fast / slow - 1) * 100);
  const growth = L.grid[5][1] / L.grid[0][1];

  return (
    <section className="mt-14">
      <VHead num="VARIANT 03" title="Hastighets-sammenligning" desc="Én lengde · hvordan greenfart forsterker breaken på hvert fall." />
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-end gap-5 mb-5 flex-wrap">
          <div>
            <CtrlLabel>Lengde</CtrlLabel>
            <Seg items={C.LEN.map(l => l.m)} active={len} onPick={setLen} />
          </div>
          <p className="flex-1 min-w-[280px] text-[14px] leading-relaxed text-foreground">
            På <strong>{L.m}</strong> legger en rask green (stimp 12) på{" "}
            <span className="font-mono font-extrabold text-primary tabular-nums">~{speedPct} %</span>{" "}
            mer break enn en treg (stimp 8) ved samme fall.{" "}
            Fra 0,5 % til 3 % fall{" "}
            <span className="font-mono font-extrabold text-primary tabular-nums">{C.comma1(growth)}×</span>-er utslaget.
          </p>
        </div>
        <div>
          {L.grid.map((row, si) => (
            <div key={si} className={`grid items-center gap-4 py-2.5 ${si > 0 ? "border-t border-border" : ""}`} style={{ gridTemplateColumns: "64px 1fr" }}>
              <span className="font-mono text-[14px] font-extrabold tabular-nums">{C.SLOPES[si]}</span>
              <div className="flex flex-col gap-1.5">
                {row.map((v, sp) => {
                  const w = Math.max(3, Math.round((v / localMax) * 100));
                  return (
                    <div key={sp} className="grid items-center gap-2.5" style={{ gridTemplateColumns: "56px 1fr 52px" }}>
                      <span className="font-mono text-[9px] font-bold tracking-[0.06em] uppercase text-muted-foreground">
                        STIMP {C.SPEEDS[sp]}
                      </span>
                      <div className="h-3.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-[width] duration-300"
                          style={{ width: `${w}%`, background: SPEED_FILL[sp] }}
                        />
                      </div>
                      <span className="font-mono text-[13px] font-extrabold text-right tabular-nums">{v} cm</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-border flex-wrap">
          <span className="font-mono text-[9px] font-extrabold tracking-[0.10em] uppercase text-muted-foreground">Mørkere = raskere green</span>
          {([["Stimp 8 · treg", 0], ["Stimp 10", 1], ["Stimp 12 · rask", 2]] as [string, number][]).map(([label, i]) => (
            <span key={i} className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-foreground">
              <span className="inline-block w-5 h-2.5 rounded-full" style={{ background: SPEED_FILL[i] }} />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function BreakTabellClient() {
  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-24 pt-12 md:px-8">
      {/* Page header */}
      <div className="mb-2">
        <span className="font-mono text-[9px] font-extrabold tracking-[0.12em] uppercase text-muted-foreground">
          AK GOLF HQ · PLAYERHQ · GREEN-LESING
        </span>
        <h1 className="font-display font-bold text-4xl tracking-tight leading-[1.02] mt-1.5">
          Hvor mye <em className="not-italic text-primary font-normal">brekker</em> putten?
        </h1>
        <p className="mt-3 max-w-[64ch] text-[15px] leading-relaxed text-muted-foreground">
          Centimeter å sikte{" "}
          <strong className="text-foreground font-semibold">utenfor hullet, på høysiden</strong>{" "}
          — som funksjon av lengde, fall og greenhastighet (stimp). Samme referansetabell, tre måter å lese den på.
        </p>
      </div>

      <MatriksView />
      <KalkulatorView />
      <SammenligningView />

      <p className="mt-16 pt-5 border-t border-border font-mono text-[10px] text-muted-foreground leading-relaxed tracking-[0.02em]">
        <strong className="text-foreground font-bold">Lesing:</strong> Tallene er centimeter å sikte på høysiden av hullet. Stimp = greenhastighet (høyere = raskere). Avlesningene gjelder en jevn, ensartet helling — les alltid det reelle fallet på stedet.{" "}
        <strong className="text-foreground font-bold">Referanse:</strong> hullkant 5,4 cm · ball 4,0 cm · fot (str. 42) ≈ 30 cm.
      </p>
    </div>
  );
}
