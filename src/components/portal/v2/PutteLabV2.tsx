"use client";

/**
 * PlayerHQ · Putte-laboratoriet — v2 Presis + B-pakke (status + én primær CTA, tom = vei).
 * T.* only. Lys PlayerHQ.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import * as C from "@/lib/putt-core";
import type { QVals, StageKey } from "@/lib/putt-core";
import { T, Caps, Tittel, Kort, Knapp, Glider, HjelpTips } from "@/components/v2";

// ─── Typer ─────────────────────────────────────────────────────────────────

type Dir = "gn" | "kj" | "kn";

// ─── Konstanter (uendret fra legacy) ───────────────────────────────────────

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

// ─── Farge-avledninger (ingen rå hex — alt via T + color-mix) ──────────────

const KAT = {
  ctrl: T.forest,
  ext: T.warn,
  mind: T.lime,
} as const;

const GRESS = {
  ramme: `color-mix(in srgb, ${T.forest} 62%, black)`,
  bunn: `color-mix(in srgb, ${T.forest} 78%, black)`,
  feltLys: `color-mix(in srgb, ${T.forest} 72%, white)`,
  feltMid: `color-mix(in srgb, ${T.forest} 88%, white)`,
  feltMork: `color-mix(in srgb, ${T.forest} 80%, black)`,
  kant: `color-mix(in srgb, ${T.forest} 45%, white)`,
};

const KRITT = "rgba(255,255,255,0.95)";
const BLEKK = "rgba(0,0,0,0.55)";

// ─── Delte kontroller ──────────────────────────────────────────────────────

function CtrlLabel({ children }: { children: React.ReactNode }) {
  return <Caps size={9} style={{ marginBottom: 8 }}>{children}</Caps>;
}

/* Enkeltvalg-segmenter — PillVelger-idiomet m/ flexWrap (8 lengder på mobil). */
function Seg({ items, active, onPick }: { items: string[]; active: number; onPick: (i: number) => void }) {
  return (
    <div style={{ display: "inline-flex", flexWrap: "wrap", gap: 3, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 12, padding: 3 }}>
      {items.map((it, i) => {
        const on = i === active;
        return (
          <button
            key={i}
            className="v2-press v2-focus"
            onClick={() => onPick(i)}
            aria-pressed={on}
            style={{ appearance: "none", cursor: "pointer", fontFamily: T.mono, fontSize: 12, fontWeight: 700, fontVariantNumeric: "tabular-nums", padding: "7px 12px", borderRadius: 9, whiteSpace: "nowrap", background: on ? T.fg : "transparent", color: on ? T.bg : T.fg2, border: "none" }}
          >
            {it}
          </button>
        );
      })}
    </div>
  );
}

// ─── Greenen (Retning A) ───────────────────────────────────────────────────

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
      style={{ display: "block", width: "100%", height: "auto", touchAction: "none" }}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <defs>
        <radialGradient id="gnFelt" cx="50%" cy="42%" r="70%">
          <stop offset="0%" stopColor={GRESS.feltLys} />
          <stop offset="70%" stopColor={GRESS.feltMid} />
          <stop offset="100%" stopColor={GRESS.feltMork} />
        </radialGradient>
        <linearGradient id="gnTilt" x1={`${gx1}%`} y1={`${gy1}%`} x2={`${gx2}%`} y2={`${gy2}%`}>
          <stop offset="0%" stopColor="white" stopOpacity="0.16" />
          <stop offset="50%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.30" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={H} fill={GRESS.bunn} />
      <ellipse cx={GCX} cy={GCY} rx="252" ry="206" fill="url(#gnFelt)" />
      <ellipse cx={GCX} cy={GCY} rx="252" ry="206" fill="url(#gnTilt)" />
      <ellipse cx={GCX} cy={GCY} rx="252" ry="206" fill="none" stroke={GRESS.kant} strokeWidth="2" strokeOpacity="0.5" />

      <circle cx={GCX} cy={GCY} r={RING_R} fill="none" stroke={KRITT} strokeOpacity="0.20" strokeWidth="1.5" strokeDasharray="3 5" />
      <g style={{ cursor: "grab" }} onPointerDown={handleSlopeDown}>
        <line x1={GCX} y1={GCY} x2={kx} y2={ky} stroke={KRITT} strokeOpacity="0.5" strokeWidth="2" />
        <circle cx={GCX} cy={GCY} r="4" fill={KRITT} fillOpacity="0.7" />
        <g transform={`translate(${kx},${ky}) rotate(${s.dir})`}>
          <circle r="15" fill={BLEKK} stroke={T.lime} strokeWidth="2" />
          <path d="M0 7 L0 -6 M-4 -2 L0 -7 L4 -2" fill="none" stroke={T.lime} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
      <text x={GCX} y={GCY + RING_R + 18} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="9" fontWeight="700" fill={KRITT} fillOpacity="0.6" letterSpacing="1">FALL ↓ {s.dir}°</text>

      <path d={prev} fill="none" stroke={BLEKK} strokeOpacity="0.8" strokeWidth="2.5" strokeDasharray="3 6" strokeLinecap="round" />
      <line x1={CX} y1={BALL_Y} x2={aimX} y2={HOLE_Y} stroke={T.lime} strokeWidth="2.5" strokeDasharray="7 5" strokeLinecap="round" />

      <g opacity={Math.abs(aimX - ghost) > 2 ? 0.8 : 0}>
        <line x1={ghost} y1={HOLE_Y - 13} x2={ghost} y2={HOLE_Y + 13} stroke={KRITT} strokeWidth="1.5" strokeDasharray="2 3" strokeOpacity="0.65" />
        <text x={ghost} y={HOLE_Y - 18} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700" fill={KRITT} fillOpacity="0.7">IDEELT</text>
      </g>

      <ellipse cx={CX} cy={HOLE_Y} rx="11" ry="9" fill={BLEKK} />
      <ellipse cx={CX} cy={HOLE_Y} rx="11" ry="9" fill="none" stroke={KRITT} strokeWidth="1.5" strokeOpacity="0.5" />
      <line x1={CX} y1={HOLE_Y} x2={CX} y2={HOLE_Y - 44} stroke={KRITT} strokeWidth="2" />
      <path d={`M${CX} ${HOLE_Y - 44} L${CX + 22} ${HOLE_Y - 38} L${CX} ${HOLE_Y - 32} Z`} fill={T.lime} />

      <g style={{ cursor: "ew-resize" }} transform={`translate(${aimX},${HOLE_Y})`} onPointerDown={handleAimDown}>
        <path d="M0 -26 L7 -16 L0 -6 L-7 -16 Z" fill={T.lime} stroke={BLEKK} strokeWidth="1.5" />
        <text x="0" y="-30" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="800" fill={KRITT}>SIKT</text>
      </g>

      <circle
        id="gn-ball"
        cx={ballPos.x}
        cy={ballPos.y}
        r="7"
        fill={KRITT}
        stroke={BLEKK}
        strokeOpacity="0.35"
        strokeWidth="1"
      />
      <text x={CX} y={BALL_Y + 22} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="8" fontWeight="700" fill={KRITT} fillOpacity="0.7">BALL</text>
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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, alignItems: "start" }}>
      <div>
        <div style={{ background: GRESS.ramme, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
          <GnSvg s={s} ballPos={ballPos} onDragSlope={handleDragSlope} onDragAim={handleDragAim} />
        </div>
        <p style={{ margin: "10px 0 0", fontFamily: T.mono, fontSize: 10, color: T.mut, lineHeight: 1.7 }}>
          {result
            ? "Endre ett ledd om gangen — sikte, fart eller lesing — og se hva som skal til for å vende bom til treff."
            : "Dra det limefargede siktepunktet for å sikte, og fallpilen i midten for å endre helningsretning. Doser farten — den markerte sonen er «død i hullet»."}
        </p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <CtrlLabel>Lengde</CtrlLabel>
          <Seg items={C.LEN.map(l => l.m)} active={s.len} onPick={updateLen} />
        </div>
        <div>
          <CtrlLabel>Fall</CtrlLabel>
          <Seg items={C.SLOPES} active={s.slope} onPick={updateSlope} />
        </div>
        <div>
          <CtrlLabel>Greenfart · stimp <HjelpTips k="stimp" size={11} /></CtrlLabel>
          <Seg items={["8", "9", "10", "11", "12", "13"]} active={s.stimp - 8} onPick={updateStimp} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { l: "Sideveis break", v: `${Math.round(d.sideBreakCm)} cm` },
            { l: "Eff. stimp", v: C.comma1(d.effStimp) },
            { l: "Du sikter", v: `${Math.round(aimCm)} cm ${sideWord}` },
            { l: gradeName, v: gradeVal },
          ].map(r => (
            <div key={r.l} style={{ background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12 }}>
              <Caps size={9}>{r.l}</Caps>
              <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 20, lineHeight: 1.2, color: T.fg, marginTop: 3, fontVariantNumeric: "tabular-nums" }}>{r.v}</div>
            </div>
          ))}
        </div>

        <div>
          <CtrlLabel>Lengde-dosering</CtrlLabel>
          <div style={{ position: "relative", height: 24, display: "flex", alignItems: "center" }}>
            <div style={{ position: "absolute", left: 0, right: 0, height: 7, borderRadius: 9999, background: T.track }} />
            {/* «Død i hullet»-sonen */}
            <div style={{ position: "absolute", left: `${lo}%`, width: `${hi - lo}%`, height: 7, borderRadius: 9999, background: `color-mix(in srgb, ${T.up} 30%, transparent)`, pointerEvents: "none" }} />
            <div style={{ position: "absolute", left: 0, width: `${((s.pace - 20) / 65) * 100}%`, height: 7, borderRadius: 9999, background: T.lime, opacity: 0.85 }} />
            <span style={{ position: "absolute", left: `calc(${((s.pace - 20) / 65) * 100}% - 9px)`, width: 18, height: 18, borderRadius: 9999, background: T.lime, border: `2px solid ${T.panel}`, pointerEvents: "none" }} />
            <input
              type="range" min="20" max="85" value={s.pace}
              onChange={e => setS(prev => ({ ...prev, pace: +e.target.value }))}
              aria-label="Lengde-dosering"
              style={{ position: "absolute", left: 0, right: 0, width: "100%", opacity: 0, cursor: "grab", height: 24, margin: 0 }}
            />
          </div>
        </div>

        {!result ? (
          <Knapp full icon="play" onClick={hit} disabled={s.phase === "rolling"}>
            Slå putten
          </Knapp>
        ) : (
          <>
            <div style={{ borderRadius: 12, padding: 16, background: result.make ? T.forest : T.panel2, border: result.make ? "none" : `1px solid ${T.border}` }}>
              <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 20, lineHeight: 1.2, letterSpacing: "-0.02em", color: result.make ? T.lime : T.fg }}>
                {result.make ? "I hull" : result.tooShort ? "Kom ikke fram" : result.tooLong ? "Løp forbi" : Math.abs(result.missCm) > result.capCm * 1.8 ? `Bommet ${result.missCm > 0 ? "høyre" : "venstre"}` : "Lipp-out"}
              </div>
              <div style={{ fontFamily: T.ui, fontSize: 12.5, lineHeight: 1.55, marginTop: 8, color: result.make ? "rgba(255,255,255,0.85)" : T.mut }}>
                {result.make && `Perfekt kjede: lest ${Math.round(result.sideBreakCm)} cm break, siktet riktig og doserte farten i sonen.`}
                {!result.make && result.tooShort && <><strong>Lengde.</strong> For løs — putten døde før hullet og tok mer break på veien. Slå den forbi, ikke til.</>}
                {!result.make && result.tooLong && <><strong>Lengde.</strong> For hard — ballen tok lite break og fór over. Mindre fart gir både snillere kant og mer fall.</>}
                {!result.make && !result.tooShort && !result.tooLong && Math.abs(result.missCm) > result.capCm * 1.8 && <><strong>Sikte / lesing.</strong> Ballen passerte hullet {Math.abs(Math.round(result.missCm))} cm på {result.missCm > 0 ? "høyre" : "venstre"}sida.</>}
                {!result.make && !result.tooShort && !result.tooLong && Math.abs(result.missCm) <= result.capCm * 1.8 && <><strong>Flaks — og aksept.</strong> Du leste, siktet og doserte riktig; ballen tok kanten og spratt ut ({Math.abs(Math.round(result.missCm))} cm). Det leddet styrer du ikke.</>}
              </div>
            </div>
            <Knapp full ghost icon="rotate-cw" onClick={reset}>
              Slå igjen
            </Knapp>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Kjeden (Retning B) ────────────────────────────────────────────────────

const Q_LABELS: [number, string][] = [[0, "Elendig"], [0.3, "Svak"], [0.5, "Ujevn"], [0.68, "Solid"], [0.85, "Skarp"], [0.95, "Tour"]];
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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div><CtrlLabel>Lengde</CtrlLabel><Seg items={C.LEN.map(l => l.m)} active={len} onPick={setLen} /></div>
          <div><CtrlLabel>Fall</CtrlLabel><Seg items={C.SLOPES} active={slope} onPick={setSlope} /></div>
          <div><CtrlLabel>Greenfart · stimp <HjelpTips k="stimp" size={11} /></CtrlLabel><Seg items={["8", "9", "10", "11", "12", "13"]} active={stimp - 8} onPick={i => setStimp(i + 8)} /></div>
        </div>

        <div>
          <CtrlLabel>Utførelse — sett kvaliteten på hvert ledd</CtrlLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 4 }}>
            {STAGE_KEYS.map(k => (
              <div key={k} style={k === worstKey ? { borderRadius: 12, padding: 12, background: `color-mix(in srgb, ${T.warn} 9%, transparent)`, border: `1px solid color-mix(in srgb, ${T.warn} 30%, transparent)` } : undefined}>
                <Glider
                  label={C.STAGE[k].label}
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(q[k] * 100)}
                  fmt={(v) => `${v} · ${qword(v / 100)}`}
                  onChange={(n) => setQ(prev => ({ ...prev, [k]: n / 100 }))}
                />
                <p style={{ fontFamily: T.mono, fontSize: 10, color: T.mut, margin: "4px 0 0", lineHeight: 1.5 }}>{C.STAGE[k].blurb}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <CtrlLabel>Hurtigvalg</CtrlLabel>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PRESETS.map(p => (
              <button
                key={p.label}
                className="v2-press v2-focus"
                onClick={() => applyPreset(p.q)}
                style={{ appearance: "none", cursor: "pointer", fontFamily: T.ui, fontSize: 12, fontWeight: 600, padding: "7px 13px", borderRadius: 9999, background: T.panel3, border: `1px solid ${T.borderS}`, color: T.fg }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ background: T.forest, borderRadius: 16, padding: 22 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
            <Caps size={10} color={T.lime}>Make-sannsynlighet</Caps>
            <HjelpTips k="makeProsent" size={11} />
          </span>
          <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 68, lineHeight: 1, letterSpacing: "-0.03em", marginTop: 10, color: "rgba(255,255,255,0.96)", fontVariantNumeric: "tabular-nums" }}>
            {Math.round(make * 100)}<small style={{ fontSize: 26, fontWeight: 600, color: T.lime }}> %</small>
          </div>
          <p style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: "rgba(255,255,255,0.8)", margin: "10px 0 0", lineHeight: 1.5 }}>
            Perfekt utført topper på <strong style={{ color: T.lime }}>{Math.round(geom * C.FLAX * 100)} %</strong> for denne putten — selv proffer bommer {C.LEN[len].m}. Flaks-taket spiser de siste {Math.round((1 - C.FLAX) * 100)} %.
          </p>
        </div>

        <div>
          <CtrlLabel>Hvor sjansen forsvinner — hvert ledd ganger ned</CtrlLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {gates.map(g => (
              <div key={g.key} style={{ display: "flex", alignItems: "center", gap: 12, ...(g.isWorst ? { borderRadius: 9, padding: 4, background: `color-mix(in srgb, ${T.warn} 8%, transparent)` } : null) }}>
                <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.mut, width: 108, flex: "none" }}>{g.label}</span>
                <div style={{ flex: 1, height: 7, borderRadius: 9999, background: T.track, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 9999,
                      width: `${Math.max(2, g.surv * 100)}%`,
                      background: g.cls === "geom" ? T.borderS : g.cls === "flax" ? `color-mix(in srgb, ${T.warn} 60%, transparent)` : g.isWorst ? T.warn : T.lime,
                      transition: `width 300ms ${T.ease}`,
                    }}
                  />
                </div>
                <span style={{ fontFamily: T.mono, fontSize: 12, fontWeight: 700, width: 40, textAlign: "right", color: T.fg, fontVariantNumeric: "tabular-nums" }}>{Math.round(g.surv * 100)}%</span>
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
            <div style={{ background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
              <Caps size={9} style={{ marginBottom: 6 }}>Svakeste ledd</Caps>
              <p style={{ fontFamily: T.ui, fontSize: 13, lineHeight: 1.6, color: T.fg, margin: 0 }}>
                <strong>{C.STAGE[worstKey as StageKey].label}</strong> koster deg mest — {loss} prosentpoeng. Løft det til skarpt og make-% stiger med ~<strong>{gain}</strong> poeng.
              </p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

// ─── Kontroll (Retning C) ──────────────────────────────────────────────────

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
  const stageArr: [StageKey, string][] = [["read", "Lesing"], ["aim", "Sikte"], ["start", "Ballstart"], ["pace", "Lengde"]];

  return (
    <svg viewBox={`0 0 ${VB} ${VB}`} role="img" aria-label="Kontroll-skive" style={{ width: "100%", height: "auto" }}>
      <circle cx={KCX} cy={KCY} r="196" fill="none" stroke={T.warn} strokeWidth="3" strokeDasharray="3 9" opacity="0.55" />
      <text x={KCX} y="26" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="800" letterSpacing="1.5" fill={T.warn}>FLAKS · UTENFOR KONTROLL</text>

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
            <path d={kontrollArc(r, a0, a1)} fill="none" stroke={T.track} strokeWidth="26" strokeLinecap="round" />
            <path d={kontrollArc(r, a0, fillEnd)} fill="none" stroke={T.lime} strokeWidth="26" strokeLinecap="round" />
            <text x={lp.x.toFixed(1)} y={lp.y.toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="800" fill={T.fg}>{lbl.toUpperCase()}</text>
            <text x={lp.x.toFixed(1)} y={(lp.y + 14).toFixed(1)} textAnchor="middle" dominantBaseline="middle" fontFamily="JetBrains Mono, monospace" fontSize="10" fontWeight="700" fill={T.mut}>{Math.round(q[k] * 100)}</text>
          </g>
        );
      })}

      <circle cx={KCX} cy={KCY} r="96" fill={T.lime} opacity="0.10" />
      <circle cx={KCX} cy={KCY} r="92" fill="none" stroke={T.lime} strokeWidth="2.5" />
      <text x={KCX} y={KCY - 22} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="800" letterSpacing="2" fill={T.fg2} opacity="0.8">AKSEPT</text>
      <text x={KCX} y={KCY + 18} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="58" fontWeight="700" fill={T.fg} letterSpacing="-2">{proc}</text>
      <text x={KCX} y={KCY + 44} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="700" fill={T.mut}>PROSESS-SCORE</text>
    </svg>
  );
}

function Legende() {
  return (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {([[KAT.ctrl, "I din kontroll"], [KAT.ext, "Flaks · utenfor"], [KAT.mind, "Mentalt"]] as [string, string][]).map(([farge, lbl]) => (
        <span key={lbl} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", color: T.mut }}>
          <i style={{ display: "inline-block", width: 16, height: 4, borderRadius: 3, background: farge }} />
          {lbl}
        </span>
      ))}
    </div>
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
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, alignItems: "start" }}>
      <div>
        <KontrollDial q={q} />
        <div style={{ marginTop: 10 }}>
          <Legende />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div><CtrlLabel>Putten</CtrlLabel><Seg items={C.LEN.map(l => l.m)} active={len} onPick={setLen} /></div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 160 }}><CtrlLabel>Fall</CtrlLabel><Seg items={C.SLOPES} active={slope} onPick={setSlope} /></div>
            <div style={{ flex: 1, minWidth: 120 }}><CtrlLabel>Stimp</CtrlLabel><Seg items={["8", "10", "12"]} active={[8, 10, 12].indexOf(stimp) < 0 ? 1 : [8, 10, 12].indexOf(stimp)} onPick={i => setStimp([8, 10, 12][i])} /></div>
          </div>
        </div>

        <div>
          <CtrlLabel>Det du kontrollerer</CtrlLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
            {STAGE_KEYS.map(k => (
              <Glider
                key={k}
                label={C.STAGE[k].label}
                min={0}
                max={100}
                step={1}
                value={Math.round(q[k] * 100)}
                onChange={(n) => setQ(prev => { setRunResult(null); return { ...prev, [k]: n / 100 }; })}
              />
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Caps size={9}>Prosess</Caps>
              <HjelpTips k="prosessScore" size={11} />
            </span>
            <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 32, lineHeight: 1.1, color: T.lime, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>{proc}</div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>Snitt av leddene du styrer</div>
          </div>
          <div style={{ background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 12, padding: 12 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
              <Caps size={9}>Make-rate</Caps>
              <HjelpTips k="makeProsent" size={11} />
            </span>
            <div style={{ fontFamily: T.mono, fontWeight: 700, fontSize: 32, lineHeight: 1.1, color: T.fg, marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
              {Math.round(make * 100)}<small style={{ fontSize: 16, fontWeight: 600, color: T.mut }}> %</small>
            </div>
            <div style={{ fontFamily: T.mono, fontSize: 10, color: T.mut }}>Avhenger også av flaks</div>
          </div>
        </div>

        <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, gap: 10 }}>
            <Caps size={9}>Ti putter · samme prosess</Caps>
            {runResult ? (
              <span style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 700, color: T.lime, fontVariantNumeric: "tabular-nums" }}>{makes}/10 i hull</span>
            ) : (
              <span style={{ fontFamily: T.mono, fontSize: 11, color: T.mut, fontVariantNumeric: "tabular-nums" }}>forventet {exp}/10</span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {Array.from({ length: 10 }, (_, i) => {
              const vist = runResult && i < shown;
              return (
                <div
                  key={i}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 9999,
                    transition: `background 150ms ${T.ease}, border-color 150ms ${T.ease}`,
                    background: vist ? (runResult![i] ? T.lime : `color-mix(in srgb, ${T.down} 20%, transparent)`) : T.panel3,
                    border: `2px solid ${vist ? (runResult![i] ? T.lime : `color-mix(in srgb, ${T.down} 40%, transparent)`) : T.borderS}`,
                  }}
                />
              );
            })}
          </div>
          <div style={{ marginTop: 12 }}>
            <Knapp full icon="play" onClick={runTen}>
              Slå ti putter
            </Knapp>
          </div>
        </div>

        {msg && (
          <div style={{ background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
            <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14.5, letterSpacing: "-0.01em", color: T.fg, marginBottom: 4 }}>{msg.mt}</div>
            <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, lineHeight: 1.6, margin: 0 }}>{msg.mb}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Hovedskjerm ───────────────────────────────────────────────────────────

export function PutteLabV2() {
  const [activeDir, setActiveDir] = useState<Dir>("gn");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      {/* Header */}
      <div>
        <Caps>PlayerHQ · Putte-laboratoriet</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel>
            Putten er <em style={{ fontStyle: "italic", color: T.lime }}>seks ledd</em> — break er bare ett.
          </Tittel>
        </div>
        <p style={{ margin: "12px 0 0", maxWidth: "60ch", fontFamily: T.ui, fontSize: 13.5, lineHeight: 1.6, color: T.mut }}>
          Greenhastighet og fall avgjør <strong style={{ color: T.fg }}>hvor mye putten brekker</strong> — kjernen. Men en putt går gjennom seks ledd: lese, sikte, starte ballen, dosere lengden, og til slutt det du ikke styrer. Tre verktøy, tre måter å tenke på den samme kjeden.
        </p>
      </div>

      {/* Seks-ledds-modellen */}
      <Kort pad="0">
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {MODEL_STEPS.map(([n, t, dd, c]) => (
            <div key={n} style={{ flex: 1, minWidth: 150, padding: "12px 14px", borderLeft: `3px solid ${KAT[c as keyof typeof KAT]}`, borderRight: `1px solid ${T.border}` }}>
              <span style={{ fontFamily: T.mono, fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: T.mut, display: "block" }}>{n}</span>
              <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 14.5, letterSpacing: "-0.01em", color: T.fg, display: "block", marginTop: 2 }}>{t}</span>
              <span style={{ fontFamily: T.ui, fontSize: 11.5, lineHeight: 1.45, color: T.mut, display: "block", marginTop: 4 }}>{dd}</span>
            </div>
          ))}
        </div>
      </Kort>
      <Legende />

      {/* Retningsvalg */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {DIRS.map(([k, n, tt, dd]) => {
          const on = activeDir === k;
          return (
            <button
              key={k}
              className="v2-press v2-focus"
              onClick={() => setActiveDir(k as Dir)}
              aria-pressed={on}
              style={{
                appearance: "none",
                cursor: "pointer",
                flex: 1,
                minWidth: 200,
                display: "flex",
                flexDirection: "column",
                gap: 4,
                padding: 12,
                textAlign: "left",
                borderRadius: 13,
                background: on ? T.panel3 : T.panel,
                border: `1px solid ${on ? T.lime : T.border}`,
              }}
            >
              <span style={{ fontFamily: T.mono, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", color: on ? T.lime : T.mut }}>{n}</span>
              <span style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 16, letterSpacing: "-0.01em", color: T.fg }}>{tt}</span>
              <span style={{ fontFamily: T.ui, fontSize: 11.5, lineHeight: 1.4, color: T.mut }}>{dd}</span>
            </button>
          );
        })}
      </div>

      <Kort>
        {activeDir === "gn" && <DirGreenen />}
        {activeDir === "kj" && <DirKjeden />}
        {activeDir === "kn" && <DirKontroll />}
      </Kort>

      <p style={{ margin: 0, fontFamily: T.mono, fontSize: 10, color: T.mut, lineHeight: 1.7 }}>
        {activeDir === "gn" && <><strong style={{ color: T.fg }}>Greenen:</strong> dra siktepunktet, doser farten, slå. Ballen ruller med break-at-speed-fysikken fra referansetabellen — bom på sikte eller lengde og du ser nøyaktig hvilket ledd som kostet putten.</>}
        {activeDir === "kj" && <><strong style={{ color: T.fg }}>Kjeden:</strong> make-% er et produkt, ikke en sum. Geometrien setter taket; hvert ledd du utfører dårlig ganger ned sjansen. Det svakeste leddet er der du henter mest. Flaks er taket du aldri kommer forbi.</>}
        {activeDir === "kn" && <><strong style={{ color: T.fg }}>Kontroll:</strong> prosess-scoren måler kun det du styrer. Make-raten avhenger også av flaks. Slå ti putter med samme prosess og se sprikningen — derfor dømmer du deg selv på prosessen, ikke på om den siste putten gikk i.</>}
      </p>
    </div>
  );
}
