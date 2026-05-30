"use client";

import { useRef, useState, useMemo } from "react";
import Image from "next/image";
import { Wind, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";

/* ─────────────────────────────────────────────────────────────────────────
   Interaktiv hull-analyse på foto.
   - Grønn pulserende "Tee total" på tee-boksen (anker / utslagssted).
   - Dra-bar siktelinje (aim-håndtak) → endrer retning venstre/høyre + lengde.
   - Vind-kalkulator (styrke + retning) → flytter spredningens senter (motvind
     kortere, medvind lenger, sidevind drift) og øker spredning i motvind.
   Overlay-koordinater: 100 bred × VB_H høy (matcher foto 781:1400).
   ───────────────────────────────────────────────────────────────────────── */

const ASPECT = 1400 / 781;
const VB_H = 100 * ASPECT; // 179.26
const SCALE = 2.6; // meter per overlay-enhet (for avlesninger)

const TEE = { x: 50, y: 163 }; // tee-boks (overlay)
const AIM0 = { x: 50, y: 95 }; // start-aim (landingssone)
const BASE = { side: 8.5, carry: 16 }; // 95%-ellipse-radier (overlay)

// Deterministiske enhets-gauss-par (stabile mellom renders).
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(rng: () => number) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
const UNIT = (() => {
  const rng = mulberry32(7);
  return Array.from({ length: 27 }, () => ({ sx: gauss(rng), sy: gauss(rng) }));
})();

// Aim-retning i grader (0 = rett opp hullet, + = mot høyre).
function aimAngleDeg(aim: { x: number; y: number }) {
  return (Math.atan2(aim.x - TEE.x, -(aim.y - TEE.y)) * 180) / Math.PI;
}

// Vind-effekt. windFromDeg: retning vinden kommer FRA (0 = forfra = motvind,
// 90 = fra høyre, 180 = bakfra = medvind, 270 = fra venstre).
function windEffect(windFromDeg: number, speed: number, aimDeg: number, distU: number) {
  if (speed <= 0) return { alongU: 0, acrossU: 0, spreadMul: 1 };
  const windToDeg = (windFromDeg + 180) % 360;
  const rel = (((windToDeg - aimDeg) % 360) + 360) % 360;
  const relRad = (rel * Math.PI) / 180;
  const along = Math.cos(relRad); // +1 medvind, -1 motvind
  const across = Math.sin(relRad); // +1 skyver mot høyre
  const distFactor = Math.pow(Math.max(distU, 1) / 35, 1.25);
  const alongU = along * speed * distFactor * (along >= 0 ? 0.45 : 0.75);
  const acrossU = across * speed * distFactor * 0.55;
  const spreadMul = 1 + (along < 0 ? -along : 0) * speed * 0.014;
  return { alongU, acrossU, spreadMul };
}

const dirLabel = (deg: number) => {
  const d = ((deg % 360) + 360) % 360;
  if (d < 22.5 || d >= 337.5) return "Motvind";
  if (d < 67.5) return "Mot · høyre";
  if (d < 112.5) return "Sidevind høyre";
  if (d < 157.5) return "Med · høyre";
  if (d < 202.5) return "Medvind";
  if (d < 247.5) return "Med · venstre";
  if (d < 292.5) return "Sidevind venstre";
  return "Mot · venstre";
};

const fmt = (n: number, unit: string) => `${n > 0 ? "+" : ""}${n.toFixed(0)} ${unit}`;

export function HoleAnalysis() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [aim, setAim] = useState(AIM0);
  const [speed, setSpeed] = useState(4);
  const [windFrom, setWindFrom] = useState(0); // motvind default
  const [dragging, setDragging] = useState<"aim" | "wind" | null>(null);

  const geom = useMemo(() => {
    const aimDeg = aimAngleDeg(aim);
    const aimRad = (aimDeg * Math.PI) / 180;
    const fwd = { x: Math.sin(aimRad), y: -Math.cos(aimRad) };
    const right = { x: Math.cos(aimRad), y: Math.sin(aimRad) };
    const distU = Math.hypot(aim.x - TEE.x, aim.y - TEE.y);
    const w = windEffect(windFrom, speed, aimDeg, distU);
    const C = {
      x: aim.x + fwd.x * w.alongU + right.x * w.acrossU,
      y: aim.y + fwd.y * w.alongU + right.y * w.acrossU,
    };
    const sm = w.spreadMul;
    const dots = UNIT.map((u) => ({
      x: C.x + right.x * (u.sx * BASE.side * sm) + fwd.x * (u.sy * BASE.carry * sm),
      y: C.y + right.y * (u.sx * BASE.side * sm) + fwd.y * (u.sy * BASE.carry * sm),
    }));
    return { aimDeg, C, sm, dots, w, distU };
  }, [aim, speed, windFrom]);

  function onMove(e: React.PointerEvent) {
    if (!dragging || !canvasRef.current) return;
    const r = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * VB_H;
    if (dragging === "aim") {
      setAim({
        x: Math.max(28, Math.min(72, x)),
        y: Math.max(30, Math.min(150, y)),
      });
    }
  }

  // Vind-dial: klikk/dra setter retningen vinden kommer FRA.
  function onWindPointer(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const deg = (Math.atan2(e.clientX - cx, -(e.clientY - cy)) * 180) / Math.PI;
    setWindFrom(((deg % 360) + 360) % 360);
  }

  const { aimDeg, C, sm, dots, w } = geom;

  return (
    <div className="space-y-3">
      {/* ── Canvas ── */}
      <div
        ref={canvasRef}
        onPointerMove={onMove}
        onPointerUp={() => setDragging(null)}
        onPointerLeave={() => setDragging(null)}
        className="relative mx-auto w-full max-w-[440px] touch-none select-none overflow-hidden rounded-[20px] border border-border bg-coach-sidebar shadow-card"
      >
        <Image
          src="/images/akademy/hull-ovenfra.jpg"
          alt="Hull ovenfra — fairway"
          width={781}
          height={1400}
          priority
          className="block h-auto w-full"
        />

        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-coach-sidebar/70 px-2.5 py-1 backdrop-blur-sm">
          <AthleticEyebrow tone="light">Hull 4 · 392 m · par 4</AthleticEyebrow>
        </div>

        <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-coach-sidebar/70 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-white/90 backdrop-blur-sm">
          <Wind className="h-3 w-3" strokeWidth={1.5} />
          {speed} m/s · {dirLabel(windFrom)}
        </div>

        {/* SVG-overlay */}
        <svg
          viewBox={`0 0 100 ${VB_H.toFixed(2)}`}
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden
        >
          {/* Siktelinje tee → aim */}
          <line x1={TEE.x} y1={TEE.y} x2={aim.x} y2={aim.y} stroke="hsl(var(--accent))" strokeWidth={0.5} strokeDasharray="2 2" opacity={0.85} />
          {/* 95%-ellipse (vind-justert senter, rotert til aim) */}
          <ellipse
            cx={C.x}
            cy={C.y}
            rx={BASE.side * sm}
            ry={BASE.carry * sm}
            transform={`rotate(${aimDeg} ${C.x} ${C.y})`}
            fill="hsl(var(--accent))"
            fillOpacity={0.16}
            stroke="hsl(var(--accent))"
            strokeWidth={0.6}
            strokeOpacity={0.85}
          />
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={0.85} fill="#fff" fillOpacity={0.9} stroke="hsl(var(--primary))" strokeWidth={0.18} />
          ))}
          <circle cx={C.x} cy={C.y} r={1.5} fill="hsl(var(--accent))" stroke="hsl(var(--primary))" strokeWidth={0.4} />
        </svg>

        {/* Grønn pulserende "Tee total" på tee-boksen */}
        <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${TEE.x}%`, top: `${(TEE.y / VB_H) * 100}%` }}>
          <span className="relative flex h-7 w-7 items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-accent/40 motion-safe:animate-ping" />
            <span className="relative inline-flex h-4 w-4 rounded-full bg-accent ring-2 ring-coach-sidebar" />
          </span>
          <span className="absolute left-1/2 top-[calc(100%+3px)] -translate-x-1/2 whitespace-nowrap rounded-full bg-card px-2 py-0.5 shadow-card">
            <span className="font-mono text-[8px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Tee total</span>
          </span>
        </div>

        {/* Dra-bart aim-håndtak */}
        <button
          type="button"
          aria-label="Dra siktet"
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setDragging("aim"); }}
          onPointerMove={onMove}
          onPointerUp={(e) => { e.currentTarget.releasePointerCapture(e.pointerId); setDragging(null); }}
          className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none active:cursor-grabbing"
          style={{ left: `${aim.x}%`, top: `${(aim.y / VB_H) * 100}%` }}
        >
          <span className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-accent/30 shadow-card" />
          <span className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" />
        </button>
      </div>

      {/* ── Vind-kalkulator + avlesninger ── */}
      <div className="mx-auto w-full max-w-[440px] rounded-[14px] border border-border bg-card p-3">
        <div className="flex items-center gap-3">
          {/* Dial */}
          <div
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setDragging("wind"); onWindPointer(e); }}
            onPointerMove={(e) => { if (dragging === "wind") onWindPointer(e); }}
            onPointerUp={() => setDragging(null)}
            className="relative h-14 w-14 flex-shrink-0 cursor-pointer touch-none rounded-full border border-border bg-background"
            role="slider"
            aria-label="Vindretning"
            aria-valuenow={Math.round(windFrom)}
          >
            <span className="absolute left-1 top-1 font-mono text-[7px] font-bold text-muted-foreground">MOT</span>
            <span className="absolute bottom-1 right-1 font-mono text-[7px] font-bold text-muted-foreground">MED</span>
            <Navigation
              className="absolute left-1/2 top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-primary"
              strokeWidth={2}
              style={{ transform: `translate(-50%,-50%) rotate(${windFrom + 180}deg)` }}
            />
          </div>

          {/* Speed slider */}
          <div className="flex-1">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">Vindstyrke</span>
              <span className="font-mono text-sm font-bold tabular-nums text-foreground">{speed} <span className="text-[10px] text-muted-foreground">m/s</span></span>
            </div>
            <input
              type="range"
              min={0}
              max={14}
              step={1}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
            />
            <div className="mt-1 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground">{dirLabel(windFrom)}</div>
          </div>
        </div>

        {/* Live avlesninger */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Readout label="Distanse" value={fmt(w.alongU * SCALE, "m")} good={w.alongU >= 0} />
          <Readout label="Side-drift" value={fmt(w.acrossU * SCALE, "m")} neutral />
          <Readout label="Spredning" value={`+${Math.round((sm - 1) * 100)} %`} bad={sm > 1.001} />
        </div>
        <p className="mt-2.5 text-[11px] leading-[1.4] text-muted-foreground">
          Dra det hvite siktet for å endre retning, og still vinden i dialen — ellipsen flytter seg live.
        </p>
      </div>
    </div>
  );
}

function Readout({ label, value, good, bad, neutral }: { label: string; value: string; good?: boolean; bad?: boolean; neutral?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background px-2.5 py-2">
      <div className="font-mono text-[8px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 font-mono text-sm font-bold tabular-nums leading-none", neutral ? "text-foreground" : good ? "text-success" : bad ? "text-warning" : "text-foreground")}>{value}</div>
    </div>
  );
}
