"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import * as C from "@/lib/putt-core";
import type { QVals, StageKey } from "@/lib/putt-core";

// ─── Types ─────────────────────────────────────────────────────────────────

type Dir = "gn" | "kj" | "kn";

// ─── Constants ─────────────────────────────────────────────────────────────

const MODEL_STEPS = [
  ["01", "Green-lesing", "Fall, retning, korn — hvor mye og hvilken vei", "ctrl"],
  ["02", "Sikte", "Pek putteren på startlinjen", "ctrl"],
  ["03", "Ballstart", "Teknisk: ballen må starte på linjen", "ctrl"],
  ["04", "Lengde", "Farten ut — for løs eller hard bommer", "ctrl"],
  ["05", "Flaks / uflaks", "Spor i gresset, ytre påvirkning", "ext"],
  ["06", "Aksept", "Gjort alt rett, putten går ikke i", "mind"],
] as const;

const DIRS = [
  ["gn", "RETNING A", "Greenen", "Romlig simulator — føl breaken"],
  ["kj", "RETNING B", "Kjeden", "Sannsynlighet — hvor du lekker make-%"],
  ["kn", "RETNING C", "Kontroll", "Mentalt — prosess vs. resultat"],
] as const;

const STAGE_KEYS: StageKey[] = ["read", "aim", "start", "pace"];

const PRESETS: { label: string; q: QVals }[] = [
  { label: "Skarp",            q: { read: 0.92, aim: 0.90, start: 0.90, pace: 0.88 } },
  { label: "Snitt-runde",      q: { read: 0.80, aim: 0.74, start: 0.80, pace: 0.66 } },
  { label: "Sliter med lengde",q: { read: 0.85, aim: 0.82, start: 0.84, pace: 0.42 } },
  { label: "Sikte-lekkasje",   q: { read: 0.86, aim: 0.50, start: 0.80, pace: 0.72 } },
];

// ─── Shared Seg control ────────────────────────────────────────────────────

function Seg({ items, active, onPick }: { items: string[]; active: number; onPick: (i: number) => void }) {
  return (
    <div className="inline-flex flex-wrap gap-[3px] bg-secondary p-[3px] rounded-md">
      {items.map((it, i) => (
        <button
          key={i}
          onClick={() => onPick(i)}
          className={`font-mono text-xs font-bold px-3 py-2 rounded-sm transition-colors whitespace-nowrap ${
            i === active
              ? "bg-card text-foreground shadow-sm"
              : "bg-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {it}
        </button>
      ))}
    </div>
  );
}

function CtrlLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground block mb-2">
      {children}
    </span>
  );
}

// ─── Greenen (Direction A) ─────────────────────────────────────────────────

type GnState = {
  len: number; slope: number; stimp: number;
  dir: number; aimX: number; pace: number;
  phase: "setup" | "rolling";
};

const W = 560, H = 472, CX = 280, HOLE_Y = 76, BALL_Y = 408;
const GCX = 280, GCY = 250, RING_R = 86;

function deriveGn(s: GnState) {
  const L = C.LEN[s.len];
  const phi = s.dir * Math.PI / 180;
  const sinp = Math.sin(phi), cosp = Math.cos(phi);
  const slopePct = C.SLOPE_PCT[s.slope];
  const rate = s.stimp >= 11 ? 2.0 : 1.5;
  const effStimp = C.clamp(s.stimp + cosp * slopePct * rate * 0.6, 6, 15);
  const breakBase = C.breakAtStimp(s.len, s.slope, effStimp);
  const sideBreakCm = breakBase * Math.abs(sinp);
  const pxPerCm = (BALL_Y - HOLE_Y) / L.cm;
  let breakPx = sideBreakCm * pxPerCm;
  breakPx = C.clamp(breakPx, 0, 168);
  const sideDir = sinp >= 0 ? 1 : -1;
  const aimXIdeal = CX - sideDir * breakPx;
  const idealPace = C.clamp(50 - cosp * slopePct * 4.5, 30, 72);
  return { L, phi, sinp, cosp, slopePct, effStimp, breakBase, sideBreakCm, pxPerCm, breakPx, sideDir, aimXIdeal, idealPace };
}

function qpt(p0: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }, t: number) {
  const u = 1 - t;
  return { x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x, y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y };
}

type GnResult = {
  make: boolean; tooShort: boolean; tooLong: boolean;
  missCm: number; capCm: number; rollFactor: number;
  sideBreakCm: number; cosp: number;
} | null;

function GnSvg({ s, ballPos, onDragSlope, onDragAim }: {
  s: GnState;
  ballPos: { x: number; y: number };
  onDragSlope: (dir: number) => void;
  onDragAim: (aimX: number) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<"slope" | "aim" | null>(null);

  const d = deriveGn(s);
  const aimX = s.aimX;
  const ghost = d.aimXIdeal;

  const kx = GCX + RING_R * Math.sin(d.phi);
  const ky = GCY - RING_R * Math.cos(d.phi);

  const lowAngle = d.phi;
  const gx1 = 50 - Math.sin(lowAngle) * 50, gy1 = 50 + Math.cos(lowAngle) * 50;
  const gx2 = 50 + Math.sin(lowAngle) * 50, gy2 = 50 - Math.cos(lowAngle) * 50;

  const p0 = { x: CX, y: BALL_Y }, p2 = { x: CX, y: HOLE_Y }, p1 = { x: aimX, y: HOLE_Y + (BALL_Y - HOLE_Y) * 0.34 };
  let prev = "";
  for (let t = 0; t <= 1.001; t += 0.05) {
    const p = qpt(p0, p1, p2, t);
    prev += (t === 0 ? "M" : "L") + p.x.toFixed(1) + " " + p.y.toFixed(1) + " ";
  }

  function svgPoint(e: React.PointerEvent<SVGSVGElement>) {
    const svg = svgRef.current!;
    const r = svg.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) / r.width * W,
      y: (e.clientY - r.top) / r.height * H,
    };
  }

  const handleSlopeDown = useCallback((e: React.PointerEvent) => {
    if (s.phase === "rolling") return;
    dragRef.current = "slope";
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    e.preventDefault();
  }, [s.phase]);

  const handleAimDown = useCallback((e: React.PointerEvent) => {
    if (s.phase === "rolling") return;
    dragRef.current = "aim";
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    e.preventDefault();
  }, [s.phase]);

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragRef.current) return;
    const p = svgPoint(e);
    if (dragRef.current === "aim") {
      onDragAim(C.clamp(p.x, CX - 150, CX + 150));
    } else {
      let ang = Math.atan2(p.x - GCX, -(p.y - GCY)) * 180 / Math.PI;
      if (ang < 0) ang += 360;
      onDragSlope(Math.round(ang));
    }
  }

  function handlePointerUp() { dragRef.current = null; }

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Green sett ovenfra"
      className="block w-full h-auto touch-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <defs>
        <radialGradient id="gnFelt" cx="50%" cy="42%" r="70%">
          <stop offset="0%" stopColor="#3f7d50" />
          <stop offset="70%" stopColor="#2f6b41" />
          <stop offset="100%" stopColor="#255736" />
        </radialGradient>
        <linearGradient id="gnTilt" x1={`${gx1}%`} y1={`${gy1}%`} x2={`${gx2}%`} y2={`${gy2}%`}>
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
          <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="100%" stopColor="#0A1F17" stopOpacity="0.30" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={H} fill="#214e32" />
      <ellipse cx={GCX} cy={GCY} rx="252" ry="206" fill="url(#gnFelt)" />
      <ellipse cx={GCX} cy={GCY} rx="252" ry="206" fill="url(#gnTilt)" />
      <ellipse cx={GCX} cy={GCY} rx="252" ry="206" fill="none" stroke="#7fae86" strokeWidth="2" strokeOpacity="0.5" />

      <circle cx={GCX} cy={GCY} r={RING_R} fill="none" stroke="#FAFAF7" strokeOpacity="0.20" strokeWidth="1.5" strokeDasharray="3 5" />
      <g style={{ cursor: "grab" }} onPointerDown={handleSlopeDown}>
        <line x1={GCX} y1={GCY} x2={kx} y2={ky} stroke="#FAFAF7" strokeOpacity="0.5" strokeWidth="2" />
        <circle cx={GCX} cy={GCY} r="4" fill="#FAFAF7" fillOpacity="0.7" />
        <g transform={`translate(${kx},${ky}) rotate(${s.dir})`}>
          <circle r="15" fill="#0A1F17" fillOpacity="0.55" stroke="hsl(var(--accent))" strokeWidth="2" />
          <path d="M0 7 L0 -6 M-4 -2 L0 -7 L4 -2" fill="none" stroke="hsl(var(--accent))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
      <text x={GCX} y={GCY + RING_R + 18} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fontWeight="700" fill="#FAFAF7" fillOpacity="0.6" letterSpacing="1">FALL ↓ {s.dir}°</text>

      <path d={prev} fill="none" stroke="#0A1F17" strokeOpacity="0.45" strokeWidth="2.5" strokeDasharray="3 6" strokeLinecap="round" />
      <line x1={CX} y1={BALL_Y} x2={aimX} y2={HOLE_Y} stroke="hsl(var(--accent))" strokeWidth="2.5" strokeDasharray="7 5" strokeLinecap="round" />

      <g opacity={Math.abs(aimX - ghost) > 2 ? 0.8 : 0}>
        <line x1={ghost} y1={HOLE_Y - 13} x2={ghost} y2={HOLE_Y + 13} stroke="#FAFAF7" strokeWidth="1.5" strokeDasharray="2 3" strokeOpacity="0.65" />
        <text x={ghost} y={HOLE_Y - 18} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700" fill="#FAFAF7" fillOpacity="0.7">IDEELT</text>
      </g>

      <ellipse cx={CX} cy={HOLE_Y} rx="11" ry="9" fill="#0A1F17" />
      <ellipse cx={CX} cy={HOLE_Y} rx="11" ry="9" fill="none" stroke="#FAFAF7" strokeWidth="1.5" strokeOpacity="0.5" />
      <line x1={CX} y1={HOLE_Y} x2={CX} y2={HOLE_Y - 44} stroke="#FAFAF7" strokeWidth="2" />
      <path d={`M${CX} ${HOLE_Y - 44} L${CX + 22} ${HOLE_Y - 38} L${CX} ${HOLE_Y - 32} Z`} fill="hsl(var(--accent))" />

      <g style={{ cursor: "ew-resize" }} transform={`translate(${aimX},${HOLE_Y})`} onPointerDown={handleAimDown}>
        <path d="M0 -26 L7 -16 L0 -6 L-7 -16 Z" fill="hsl(var(--accent))" stroke="#0A1F17" strokeWidth="1.5" />
        <text x="0" y="-30" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="800" fill="#FAFAF7">SIKT</text>
      </g>

      <circle
        id="gn-ball"
        cx={ballPos.x}
        cy={ballPos.y}
        r="7"
        fill="#FAFAF7"
        stroke="#0A1F17"
        strokeOpacity="0.25"
        strokeWidth="1"
      />
      <text x={CX} y={BALL_Y + 22} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700" fill="#FAFAF7" fillOpacity="0.7">BALL</text>
    </svg>
  );
}

function DirGreenen() {
  const [s, setS] = useState<GnState>(() => {
    const init = { len: 3, slope: 2, stimp: 10, dir: 90, aimX: 0, pace: 50, phase: "setup" as const };
    const d = deriveGn(init);
    return { ...init, aimX: d.aimXIdeal };
  });
  const [ballPos, setBallPos] = useState({ x: CX, y: BALL_Y });
  const [result, setResult] = useState<GnResult>(null);
  const frameRef = useRef<number | null>(null);

  function updateLen(i: number) {
    setS(prev => { const n = { ...prev, len: i }; const d = deriveGn(n); return { ...n, aimX: d.aimXIdeal }; });
    setBallPos({ x: CX, y: BALL_Y }); setResult(null);
  }
  function updateSlope(i: number) {
    setS(prev => { const n = { ...prev, slope: i }; const d = deriveGn(n); return { ...n, aimX: d.aimXIdeal }; });
    setBallPos({ x: CX, y: BALL_Y }); setResult(null);
  }
  function updateStimp(i: number) {
    setS(prev => { const n = { ...prev, stimp: i + 8 }; const d = deriveGn(n); return { ...n, aimX: d.aimXIdeal }; });
    setBallPos({ x: CX, y: BALL_Y }); setResult(null);
  }
  const handleDragSlope = useCallback((dir: number) => {
    setS(prev => { const n = { ...prev, dir }; const d = deriveGn(n); return { ...n, aimX: d.aimXIdeal }; });
    setResult(null);
  }, []);
  const handleDragAim = useCallback((aimX: number) => {
    setS(prev => ({ ...prev, aimX }));
    setResult(null);
  }, []);

  function hit() {
    if (s.phase === "rolling") return;
    const d = deriveGn(s);
    const rollFactor = 0.75 + (s.pace - 20) / 65 * 0.62;
    const actualBreakPx = d.breakPx * C.clamp(1.05 / rollFactor, 0.6, 1.75);
    const flaxPx = (Math.random() - 0.5) * 7;
    const startNoise = (Math.random() - 0.5) * 5;
    const xAtHole = s.aimX + d.sideDir * actualBreakPx + flaxPx + startNoise;
    const missCm = (xAtHole - CX) / d.pxPerCm;
    const capCm = C.clamp(4.2 - Math.max(0, rollFactor - 1.0) * 5.5, 1.4, 4.2);
    const tooShort = rollFactor < 0.93;
    const tooLong = rollFactor > 1.28;
    const onLine = Math.abs(missCm) < capCm;
    const make = !tooShort && !tooLong && onLine;

    setS(prev => ({ ...prev, phase: "rolling" }));

    const p0 = { x: CX, y: BALL_Y }, p1 = { x: s.aimX, y: HOLE_Y + (BALL_Y - HOLE_Y) * 0.34 }, p2 = { x: xAtHole, y: HOLE_Y };
    const endT = make ? 1 : (tooShort ? C.clamp(rollFactor / 1.0, 0.45, 0.95) : 1);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = 1050;
    const t0 = performance.now();

    function step(ts: number) {
      const prog = Math.min(1, (ts - t0) / dur);
      const ease = 1 - Math.pow(1 - prog, 2);
      const tt = ease * (make ? 1 : endT);
      const p = qpt(p0, p1, p2, tt);
      if (tooLong && prog > 0) {
        const beyond = Math.max(0, ease - 0.85) / 0.15;
        p.y = p2.y - beyond * 46;
        p.x = p2.x + (p2.x - p1.x) * 0.04 * beyond;
      }
      setBallPos({ x: +p.x.toFixed(1), y: +p.y.toFixed(1) });
      if (prog < 1) { frameRef.current = requestAnimationFrame(step); }
      else {
        if (make) setBallPos({ x: CX, y: HOLE_Y });
        setResult({ make, tooShort, tooLong, missCm, capCm, rollFactor, sideBreakCm: d.sideBreakCm, cosp: d.cosp });
      }
    }

    if (reduce) {
      const p = qpt(p0, p1, p2, make ? 1 : endT);
      setBallPos({ x: +p.x.toFixed(1), y: +p.y.toFixed(1) });
      if (make) setBallPos({ x: CX, y: HOLE_Y });
      setResult({ make, tooShort, tooLong, missCm, capCm, rollFactor, sideBreakCm: d.sideBreakCm, cosp: d.cosp });
    } else {
      frameRef.current = requestAnimationFrame(step);
    }
  }

  function reset() {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    setS(prev => ({ ...prev, phase: "setup" }));
    setBallPos({ x: CX, y: BALL_Y });
    setResult(null);
  }

  const d = deriveGn(s);
  const aimCm = Math.abs(s.aimX - CX) / d.pxPerCm;
  const sideWord = s.aimX < CX ? "venstre" : "høyre";
  const gradeName = d.cosp > 0.15 ? "Nedover" : d.cosp < -0.15 ? "Oppover" : "Tverr";
  const gradeVal = d.cosp > 0.15 ? "raskere" : d.cosp < -0.15 ? "tregere" : "—";

  const lo = C.clamp((d.idealPace - 6 - 20) / (85 - 20) * 100, 0, 100);
  const hi = C.clamp((d.idealPace + 10 - 20) / (85 - 20) * 100, 0, 100);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
      <div>
        <div className="bg-[#1a3d26] border border-border rounded-md overflow-hidden">
          <GnSvg s={s} ballPos={ballPos} onDragSlope={handleDragSlope} onDragAim={handleDragAim} />
        </div>
        <p className="mt-3 font-mono text-[10px] text-muted-foreground leading-relaxed">
          {result
            ? "Endre ett ledd om gangen — sikte, fart eller lesing — og se hva som skal til for å vende bom til treff."
            : "Dra det limefargede siktepunktet for å sikte, og fallpilen i midten for å endre helningsretning. Doser farten — den grønne sonen er «død i hullet»."}
        </p>
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <CtrlLabel>Lengde</CtrlLabel>
          <Seg items={C.LEN.map(l => l.m)} active={s.len} onPick={updateLen} />
        </div>
        <div>
          <CtrlLabel>Fall</CtrlLabel>
          <Seg items={C.SLOPES} active={s.slope} onPick={updateSlope} />
        </div>
        <div>
          <CtrlLabel>Greenfart · stimp</CtrlLabel>
          <Seg items={["8","9","10","11","12","13"]} active={s.stimp - 8} onPick={updateStimp} />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {[
            { l: "Sideveis break", v: `${Math.round(d.sideBreakCm)} cm` },
            { l: "Eff. stimp", v: C.comma1(d.effStimp) },
            { l: "Du sikter", v: `${Math.round(aimCm)} cm ${sideWord}` },
            { l: gradeName, v: gradeVal },
          ].map(r => (
            <div key={r.l} className="bg-secondary rounded-md p-3">
              <div className="font-mono text-[9px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">{r.l}</div>
              <div className="font-mono font-bold text-[22px] leading-tight mt-0.5">{r.v}</div>
            </div>
          ))}
        </div>

        <div>
          <CtrlLabel>Lengde-dosering</CtrlLabel>
          <div className="relative">
            <input
              type="range" min="20" max="85" value={s.pace}
              onChange={e => setS(prev => ({ ...prev, pace: +e.target.value }))}
              className="w-full h-2 rounded appearance-none bg-secondary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-card cursor-grab"
            />
            <div
              className="absolute top-0 h-2 rounded bg-primary/15 pointer-events-none"
              style={{ left: `${lo}%`, width: `${hi - lo}%` }}
            />
          </div>
        </div>

        {!result ? (
          <button
            onClick={hit}
            disabled={s.phase === "rolling"}
            className="w-full h-11 bg-primary text-primary-foreground font-semibold text-sm rounded-md flex items-center justify-center gap-2 hover:brightness-110 disabled:opacity-50 transition-all"
          >
            Slå putten
          </button>
        ) : (
          <>
            <div className={`rounded-md p-4 ${result.make ? "bg-primary text-cream-50" : "bg-secondary border border-border"}`}>
              <div className={`font-display font-bold text-[22px] leading-tight tracking-tight flex items-center gap-2 ${result.make ? "text-accent" : ""}`}>
                {result.make ? "I hull" : result.tooShort ? "Kom ikke fram" : result.tooLong ? "Løp forbi" : Math.abs(result.missCm) > result.capCm * 1.8 ? `Bommet ${result.missCm > 0 ? "høyre" : "venstre"}` : "Lipp-out"}
              </div>
              <div className={`text-[12.5px] leading-[1.5] mt-2 ${result.make ? "text-white/85" : "text-muted-foreground"}`}>
                {result.make && `Perfekt kjede: lest ${Math.round(result.sideBreakCm)} cm break, siktet riktig og doserte farten i sonen.`}
                {!result.make && result.tooShort && <><strong>Lengde.</strong> For løs — putten døde før hullet og tok mer break på veien. Slå den forbi, ikke til.</>}
                {!result.make && result.tooLong && <><strong>Lengde.</strong> For hard — ballen tok lite break og fór over. Mindre fart gir både snillere kant og mer fall.</>}
                {!result.make && !result.tooShort && !result.tooLong && Math.abs(result.missCm) > result.capCm * 1.8 && <><strong>Sikte / lesing.</strong> Ballen passerte hullet {Math.abs(Math.round(result.missCm))} cm på {result.missCm > 0 ? "høyre" : "venstre"}sida.</>}
                {!result.make && !result.tooShort && !result.tooLong && Math.abs(result.missCm) <= result.capCm * 1.8 && <><strong>Flaks — og aksept.</strong> Du leste, siktet og doserte riktig; ballen tok kanten og spratt ut ({Math.abs(Math.round(result.missCm))} cm). Det leddet styrer du ikke.</>}
              </div>
            </div>
            <button
              onClick={reset}
              className="w-full h-10 bg-secondary text-foreground font-semibold text-sm rounded-md flex items-center justify-center gap-2 hover:brightness-95 transition-all"
            >
              Slå igjen
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Kjeden (Direction B) ─────────────────────────────────────────────────

const Q_LABELS: [number, string][] = [[0,"Elendig"],[0.3,"Svak"],[0.5,"Ujevn"],[0.68,"Solid"],[0.85,"Skarp"],[0.95,"Tour"]];
function qword(q: number) { let w = "Elendig"; Q_LABELS.forEach(([t, l]) => { if (q >= t) w = l; }); return w; }

function DirKjeden() {
  const [len, setLen] = useState(3);
  const [slope, setSlope] = useState(2);
  const [stimp, setStimp] = useState(10);
  const [q, setQ] = useState<QVals>({ read: 0.85, aim: 0.78, start: 0.82, pace: 0.70 });

  const geom = C.geomCeiling(len, slope, stimp);
  const make = C.makeProb(geom, q);

  function applyPreset(p: QVals) {
    setQ({ ...p });
  }

  const gates = (() => {
    const keys = STAGE_KEYS;
    let running = 1;
    const arr: { key: string; label: string; surv: number; cls?: string; isWorst?: boolean }[] = [];
    arr.push({ key: "geom", label: "Geometri", surv: geom, cls: "geom" });
    running = geom;
    let worst = { key: "", loss: -1 };
    keys.forEach(k => {
      const m = C.stageMult(k, q[k]);
      const before = running;
      running *= m;
      const loss = before - running;
      if (loss > worst.loss) worst = { key: k, loss };
      arr.push({ key: k, label: C.STAGE[k].label, surv: running });
    });
    running *= C.FLAX;
    arr.push({ key: "flax", label: "Flaks", surv: running, cls: "flax" });
    return arr.map(g => ({ ...g, isWorst: g.key === worst.key }));
  })();

  const worstKey = gates.find(g => g.isWorst)?.key ?? null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-7 items-start">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div><CtrlLabel>Lengde</CtrlLabel><Seg items={C.LEN.map(l => l.m)} active={len} onPick={setLen} /></div>
          <div><CtrlLabel>Fall</CtrlLabel><Seg items={C.SLOPES} active={slope} onPick={setSlope} /></div>
          <div><CtrlLabel>Greenfart · stimp</CtrlLabel><Seg items={["8","9","10","11","12","13"]} active={stimp - 8} onPick={i => setStimp(i + 8)} /></div>
        </div>

        <div>
          <CtrlLabel>Utførelse — sett kvaliteten på hvert ledd</CtrlLabel>
          <div className="flex flex-col gap-4 mt-1">
            {STAGE_KEYS.map(k => (
              <div key={k} className={k === worstKey ? "rounded-md p-3 bg-warning/10 border border-warning/30" : ""}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="font-display font-bold text-[15px] tracking-snug">{C.STAGE[k].label}</span>
                  <span className="font-mono text-[13px] font-extrabold text-primary">{Math.round(q[k] * 100)} · {qword(q[k])}</span>
                </div>
                <input
                  type="range" min="0" max="100" value={Math.round(q[k] * 100)}
                  onChange={e => setQ(prev => ({ ...prev, [k]: +e.target.value / 100 }))}
                  className="w-full h-2 rounded appearance-none bg-secondary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-card cursor-grab"
                />
                <p className="font-mono text-[10px] text-muted-foreground mt-1.5 leading-snug">{C.STAGE[k].blurb}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <CtrlLabel>Hurtigvalg</CtrlLabel>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => applyPreset(p.q)}
                className="font-mono text-xs font-bold px-3 py-2 bg-secondary text-muted-foreground rounded-sm hover:text-foreground transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-primary rounded-lg p-6">
          <span className="font-mono text-[10px] font-bold tracking-[0.12em] uppercase text-accent">Make-sannsynlighet</span>
          <div className="font-mono font-bold text-[80px] leading-none tracking-tight mt-2 text-card">
            {Math.round(make * 100)}<small className="text-[30px] font-semibold text-accent"> %</small>
          </div>
          <p className="font-mono text-[13px] font-bold text-white/80 mt-2 leading-snug">
            Perfekt utført topper på <strong className="text-accent">{Math.round(geom * C.FLAX * 100)} %</strong> for denne putten — selv proffer bommer {C.LEN[len].m}. Flaks-taket spiser de siste {Math.round((1 - C.FLAX) * 100)} %.
          </p>
        </div>

        <div>
          <CtrlLabel>Hvor sjansen forsvinner — hvert ledd ganger ned</CtrlLabel>
          <div className="flex flex-col gap-2 mt-2">
            {gates.map(g => (
              <div key={g.key} className={`flex items-center gap-3 ${g.isWorst ? "rounded p-1 bg-warning/8" : ""}`}>
                <span className="font-mono text-[11px] font-bold text-muted-foreground w-28 shrink-0">{g.label}</span>
                <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${g.cls === "geom" ? "bg-border" : g.cls === "flax" ? "bg-warning/60" : g.isWorst ? "bg-warning" : "bg-primary"}`}
                    style={{ width: `${Math.max(2, g.surv * 100)}%` }}
                  />
                </div>
                <span className="font-mono text-[12px] font-extrabold w-10 text-right">{Math.round(g.surv * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        {worstKey && C.STAGE[worstKey as StageKey] && (() => {
          const worstLossVal = gates.find(g => g.key === worstKey);
          const prevGate = gates[gates.findIndex(g => g.key === worstKey) - 1];
          const loss = prevGate ? Math.round((prevGate.surv - (worstLossVal?.surv ?? 0)) * 100) : 0;
          const gain = Math.round((C.makeProb(geom, { ...q, [worstKey]: 0.95 }) - make) * 100);
          return (
            <div className="bg-secondary rounded-md p-4">
              <div className="font-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground mb-1.5">Svakeste ledd</div>
              <p className="text-sm leading-relaxed text-foreground">
                <strong>{C.STAGE[worstKey as StageKey].label}</strong> koster deg mest — {loss} prosentpoeng. Løft det til skarpt og make-% stiger med ~<strong>{gain}</strong> poeng.
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ─── Kontroll (Direction C) ────────────────────────────────────────────────

const VB = 460, KCX = 230, KCY = 230;

function kontrollArc(r: number, a0: number, a1: number) {
  function kPolar(angle: number) {
    const rad = (angle - 90) * Math.PI / 180;
    return { x: KCX + r * Math.cos(rad), y: KCY + r * Math.sin(rad) };
  }
  const s = kPolar(a0), e = kPolar(a1);
  const la = (a1 - a0) > 180 ? 1 : 0;
  return `M ${s.x.toFixed(1)} ${s.y.toFixed(1)} A ${r} ${r} 0 ${la} 1 ${e.x.toFixed(1)} ${e.y.toFixed(1)}`;
}

function KontrollDial({ q }: { q: QVals }) {
  const proc = C.processScore(q);
  const r = 150;
  const stageArr: [StageKey, string][] = [["read","Lesing"],["aim","Sikte"],["start","Ballstart"],["pace","Lengde"]];

  return (
    <svg viewBox={`0 0 ${VB} ${VB}`} role="img" aria-label="Kontroll-skive" className="w-full h-auto">
      <circle cx={KCX} cy={KCY} r="196" fill="none" stroke="hsl(var(--warning))" strokeWidth="3" strokeDasharray="3 9" opacity="0.55" />
      <text x={KCX} y="26" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="800" letterSpacing="1.5" fill="hsl(var(--warning))">FLAKS · UTENFOR KONTROLL</text>

      {stageArr.map(([k, lbl], i) => {
        const a0 = i * 90 + 6, a1 = i * 90 + 84, mid = (a0 + a1) / 2;
        const fillEnd = a0 + (a1 - a0) * q[k];
        function kp(angle: number) {
          const rad = (angle - 90) * Math.PI / 180;
          return { x: KCX + (r + 34) * Math.cos(rad), y: KCY + (r + 34) * Math.sin(rad) };
        }
        const lp = kp(mid);
        return (
          <g key={k}>
            <path d={kontrollArc(r, a0, a1)} fill="none" stroke="hsl(var(--secondary))" strokeWidth="26" strokeLinecap="round" />
            <path d={kontrollArc(r, a0, fillEnd)} fill="none" stroke="hsl(var(--primary))" strokeWidth="26" strokeLinecap="round" />
            <text x={lp.x.toFixed(1)} y={lp.y.toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="800" fill="hsl(var(--foreground))">{lbl.toUpperCase()}</text>
            <text x={lp.x.toFixed(1)} y={(lp.y + 14).toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="700" fill="hsl(var(--muted-foreground))">{Math.round(q[k] * 100)}</text>
          </g>
        );
      })}

      <circle cx={KCX} cy={KCY} r="96" fill="hsl(var(--accent))" opacity="0.12" />
      <circle cx={KCX} cy={KCY} r="92" fill="none" stroke="hsl(var(--accent))" strokeWidth="2.5" />
      <text x={KCX} y={KCY - 22} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="800" letterSpacing="2" fill="hsl(var(--accent-foreground))" opacity="0.7">AKSEPT</text>
      <text x={KCX} y={KCY + 18} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="58" fontWeight="700" fill="hsl(var(--primary))" letterSpacing="-2">{proc}</text>
      <text x={KCX} y={KCY + 44} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="700" fill="hsl(var(--muted-foreground))">PROSESS-SCORE</text>
    </svg>
  );
}

function DirKontroll() {
  const [len, setLen] = useState(3);
  const [slope, setSlope] = useState(2);
  const [stimp, setStimp] = useState(10);
  const [q, setQ] = useState<QVals>({ read: 0.86, aim: 0.80, start: 0.84, pace: 0.74 });
  const [runResult, setRunResult] = useState<boolean[] | null>(null);
  const [shown, setShown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const geom = C.geomCeiling(len, slope, stimp);
  const make = C.makeProb(geom, q);
  const proc = C.processScore(q);
  const exp = Math.round(make * 10);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function runTen() {
    if (timerRef.current) clearInterval(timerRef.current);
    const results = Array.from({ length: 10 }, () => Math.random() < make);
    setRunResult(results);
    setShown(0);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setShown(10); return; }
    let i = 0;
    timerRef.current = setInterval(() => {
      i++;
      setShown(i);
      if (i >= 10) { clearInterval(timerRef.current!); timerRef.current = null; }
    }, 150);
  }

  const makes = runResult?.filter(Boolean).length ?? 0;
  const diff = makes - exp;

  function resultMsg() {
    if (!runResult) return null;
    let mt: string, mb: string;
    if (proc >= 82) {
      mt = "Du gjorde jobben.";
      mb = `Forventet ${exp}, fikk ${makes}. ${diff >= 0 ? "Bonus" : "Differansen"} er varians, ikke teknikk — prosessen din var skarp på alle fire ledd. Godta resultatet og slå neste likt.`;
    } else if (proc >= 60) {
      mt = "Solid prosess — ett ledd igjen.";
      mb = `${makes} av 10 i hull (forventet ${exp}). Du styrer det meste; hev det svakeste leddet i skiva, så følger snittet etter.`;
    } else {
      mt = "Her er det prosessen, ikke uflaks.";
      mb = `${makes} av 10 (forventet ${exp}). Med så lave ledd er bommene dine å eie, ikke flaks å skylde på. Tilbake til kjeden og bygg leddene opp.`;
    }
    return { mt, mb };
  }

  const msg = resultMsg();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-7 items-start">
      <div>
        <KontrollDial q={q} />
        <div className="flex gap-4 mt-3 flex-wrap">
          {[["bg-primary","I din kontroll"],["bg-warning","Flaks · utenfor"],["bg-accent","Mentalt"]] .map(([bg, lbl]) => (
            <span key={lbl} className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-wider text-muted-foreground">
              <i className={`${bg} inline-block w-4 h-1 rounded`} />
              {lbl}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div><CtrlLabel>Putten</CtrlLabel><Seg items={C.LEN.map(l => l.m)} active={len} onPick={setLen} /></div>
          <div className="flex gap-2.5">
            <div className="flex-1"><CtrlLabel>Fall</CtrlLabel><Seg items={C.SLOPES} active={slope} onPick={setSlope} /></div>
            <div className="flex-1"><CtrlLabel>Stimp</CtrlLabel><Seg items={["8","10","12"]} active={[8,10,12].indexOf(stimp) < 0 ? 1 : [8,10,12].indexOf(stimp)} onPick={i => setStimp([8,10,12][i])} /></div>
          </div>
        </div>

        <div>
          <CtrlLabel>Det du kontrollerer</CtrlLabel>
          <div className="flex flex-col gap-3.5 mt-1">
            {STAGE_KEYS.map(k => (
              <div key={k}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-display font-bold text-[14px] tracking-snug">{C.STAGE[k].label}</span>
                  <span className="font-mono text-[13px] font-extrabold text-primary">{Math.round(q[k] * 100)}</span>
                </div>
                <input
                  type="range" min="0" max="100" value={Math.round(q[k] * 100)}
                  onChange={e => setQ(prev => { setRunResult(null); return { ...prev, [k]: +e.target.value / 100 }; })}
                  className="w-full h-2 rounded appearance-none bg-secondary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-card cursor-grab"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-secondary rounded-md p-3">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Prosess</span>
            <div className="font-mono font-bold text-[36px] leading-tight text-primary mt-1">{proc}</div>
            <div className="font-mono text-[10px] text-muted-foreground">Snitt av leddene du styrer</div>
          </div>
          <div className="bg-secondary rounded-md p-3">
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">Make-rate</span>
            <div className="font-mono font-bold text-[36px] leading-tight mt-1">
              {Math.round(make * 100)}<small className="text-[18px] font-semibold text-muted-foreground"> %</small>
            </div>
            <div className="font-mono text-[10px] text-muted-foreground">Avhenger også av flaks</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-md p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground">Ti putter · samme prosess</span>
            {runResult && <span className="font-mono text-[11px] font-bold text-primary">{makes}/10 i hull</span>}
            {!runResult && <span className="font-mono text-[11px] text-muted-foreground">forventet {exp}/10</span>}
          </div>
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className={`w-7 h-7 rounded-full border-2 transition-all duration-150 ${
                  runResult && i < shown
                    ? runResult[i] ? "bg-primary border-primary" : "bg-destructive/20 border-destructive/40"
                    : "bg-secondary border-border"
                }`}
              />
            ))}
          </div>
          <button
            onClick={runTen}
            className="w-full mt-3 h-10 bg-primary text-primary-foreground font-semibold text-sm rounded-md flex items-center justify-center gap-2 hover:brightness-110 transition-all"
          >
            Slå ti putter
          </button>
        </div>

        {msg && (
          <div className="bg-secondary rounded-md p-4">
            <div className="font-display font-bold text-[15px] tracking-snug mb-1">{msg.mt}</div>
            <p className="text-sm text-muted-foreground leading-relaxed">{msg.mb}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

export function PutteLaboratorietClient() {
  const [activeDir, setActiveDir] = useState<Dir>("gn");

  return (
    <div className="max-w-[1280px] mx-auto px-8 py-10 pb-32">
      <header className="mb-7">
        <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
          AK GOLF HQ · PLAYERHQ · PUTTE-LABORATORIET
        </span>
        <h1 className="font-display font-bold text-4xl tracking-tight leading-[1.02] mt-2">
          Putten er <em className="not-italic font-normal text-primary">seks ledd</em> — break er bare ett.
        </h1>
        <p className="mt-3 max-w-[60ch] text-base leading-[1.55] text-muted-foreground">
          Greenhastighet og fall avgjør <strong className="text-foreground">hvor mye putten brekker</strong> — kjernen. Men en putt går gjennom seks ledd: lese, sikte, starte ballen, dosere lengden, og til slutt det du ikke styrer. Tre verktøy, tre måter å tenke på den samme kjeden.
        </p>

        <div className="mt-6 flex flex-wrap border border-border rounded-lg overflow-hidden bg-card">
          {MODEL_STEPS.map(([n, t, d, c]) => (
            <div
              key={n}
              className={`flex-1 min-w-[130px] p-3 border-r border-border last:border-r-0 relative ${
                c === "ctrl" ? "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-primary before:content-['']" :
                c === "ext"  ? "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-warning before:content-['']" :
                               "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-accent before:content-['']"
              }`}
            >
              <div className="font-mono text-[10px] font-bold tracking-[0.1em] text-muted-foreground">{n}</div>
              <div className="font-display font-bold text-[15px] tracking-snug mt-0.5">{t}</div>
              <div className="text-[11.5px] leading-[1.4] text-muted-foreground mt-1">{d}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 flex-wrap mt-3">
          {[["bg-primary","I din kontroll"],["bg-warning","Utenfor kontroll"],["bg-accent","Mentalt"]] .map(([bg, lbl]) => (
            <span key={lbl} className="flex items-center gap-2 font-mono text-[10px] font-bold tracking-wider text-muted-foreground">
              <i className={`${bg} inline-block w-4 h-1 rounded`} />
              {lbl}
            </span>
          ))}
        </div>
      </header>

      <nav className="flex gap-2 flex-wrap mb-5 sticky top-0 z-20 bg-background py-3 -mx-8 px-8">
        {DIRS.map(([k, n, tt, dd]) => (
          <button
            key={k}
            onClick={() => setActiveDir(k as Dir)}
            className={`flex-1 min-w-[220px] flex flex-col gap-1 p-3 text-left rounded-md border transition-all ${
              activeDir === k
                ? "bg-primary border-primary shadow-md"
                : "bg-card border-border text-muted-foreground hover:border-border/80"
            }`}
          >
            <span className={`font-mono text-[10px] font-extrabold tracking-[0.12em] ${activeDir === k ? "text-accent" : "text-muted-foreground"}`}>{n}</span>
            <span className={`font-display font-bold text-[17px] tracking-snug ${activeDir === k ? "text-[#FAFAF7]" : "text-foreground"}`}>{tt}</span>
            <span className={`text-[11.5px] leading-[1.35] ${activeDir === k ? "text-white/70" : "text-muted-foreground"}`}>{dd}</span>
          </button>
        ))}
      </nav>

      <div className="bg-card border border-border rounded-lg p-6">
        {activeDir === "gn" && <DirGreenen />}
        {activeDir === "kj" && <DirKjeden />}
        {activeDir === "kn" && <DirKontroll />}
      </div>

      <p className="mt-7 font-mono text-[10px] text-muted-foreground leading-relaxed">
        {activeDir === "gn" && <><strong className="text-foreground">Greenen:</strong> dra siktepunktet, doser farten, slå. Ballen ruller med break-at-speed-fysikken fra referansetabellen — bom på sikte eller lengde og du ser nøyaktig hvilket ledd som kostet putten.</>}
        {activeDir === "kj" && <><strong className="text-foreground">Kjeden:</strong> make-% er et produkt, ikke en sum. Geometrien setter taket; hvert ledd du utfører dårlig ganger ned sjansen. Det svakeste leddet er der du henter mest. Flaks er taket du aldri kommer forbi.</>}
        {activeDir === "kn" && <><strong className="text-foreground">Kontroll:</strong> prosess-scoren måler kun det du styrer. Make-raten avhenger også av flaks. Slå ti putter med samme prosess og se sprikningen — derfor dømmer du deg selv på prosessen, ikke på om den siste putten gikk i.</>}
      </p>
    </div>
  );
}
