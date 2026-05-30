"use client";

import { useState } from "react";
import Image from "next/image";
import { X, TrendingUp, Activity, Clock, Flag, ArrowLeft, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { Sparkline } from "@/components/athletic/sparkline";

/* ─────────────────────────────────────────────────────────────────────────
   Hull-analyse — TOP-DOWN på ekte foto. Illustrativt kart, men sonene fylles
   med data (SG + trening) via props. Standard = demo-data (uendret for
   /hull-demo og /intern). Portal-ruten sender ekte spillerdata.

   Foto: public/images/akademy/hull-ovenfra.jpg (1073×1600, ratio 1.491).
   Markør-posisjon: x/y i % av rammen. Hvis `putting` er tom / `green` er null
   → ingen green-zoom (putt vises som vanlig markør i `fairway`).
   ───────────────────────────────────────────────────────────────────────── */

const RATIO = 1.491; // 1600 / 1073
const PATH = "M43 119.3 Q44 107 46 95.4 Q47 86 49 77.5 Q52 69 55 61.1 Q58 53 62 44.7 Q65 36 69 26.8";

export type HoleZone = {
  id: string;
  label: string;
  sub: string;
  x: number; // % horisontalt
  y: number; // % vertikalt
  sg: number | null;
  okter: number;
  minutter: number;
  trend: number[]; // eldste → nyeste
};

const DEFAULT_FAIRWAY: HoleZone[] = [
  { id: "tee", label: "Tee total", sub: "Driver · snitt 248 m", x: 43, y: 80, sg: 0.31, okter: 8, minutter: 142, trend: [3, 4, 3, 5, 6, 5, 7, 8] },
  { id: "b200", label: "200+", sub: "Innspill · 3-tre / hybrid", x: 46, y: 64, sg: -0.12, okter: 4, minutter: 36, trend: [4, 3, 4, 3, 2, 3, 3, 2] },
  { id: "b150", label: "150–200", sub: "Innspill · 5–7 jern", x: 49, y: 52, sg: 0.08, okter: 6, minutter: 88, trend: [3, 4, 4, 5, 4, 6, 5, 6] },
  { id: "b100", label: "100–150", sub: "Innspill · 8-jern – PW", x: 55, y: 41, sg: 0.22, okter: 9, minutter: 156, trend: [4, 5, 5, 6, 6, 7, 7, 8] },
  { id: "b50", label: "50–100", sub: "Innspill · wedge", x: 62, y: 30, sg: 0.05, okter: 7, minutter: 124, trend: [3, 4, 5, 5, 6, 6, 6, 7] },
];

const DEFAULT_PUTTING: HoleZone[] = [
  { id: "naer", label: "Nærspill 0–50", sub: "Chip / pitch", x: 64, y: 23, sg: 0.02, okter: 8, minutter: 300, trend: [4, 4, 5, 5, 6, 5, 6, 7] },
  { id: "lag", label: "Lag-putt", sub: "> 5 m", x: 69, y: 18, sg: 0.11, okter: 6, minutter: 180, trend: [5, 5, 6, 6, 7, 6, 7, 8] },
  { id: "putt", label: "Putt 0–3 fot", sub: "Kortputt", x: 72, y: 14, sg: 0.18, okter: 9, minutter: 240, trend: [6, 7, 7, 8, 8, 8, 9, 9] },
];

const DEFAULT_GREEN = { x: 69, y: 18 };
const ZOOM = 2.8;

const fmtSg = (n: number | null) => {
  if (n == null) return "—";
  const s = Math.abs(n).toFixed(2).replace(".", ",");
  return n > 0 ? `+${s}` : n < 0 ? `−${s}` : s;
};

type Props = {
  fairway?: HoleZone[];
  putting?: HoleZone[];
  green?: { x: number; y: number } | null;
  holeLabel?: string;
  holeMeta?: string;
  caption?: string;
};

export function HoleAnalysis({
  fairway = DEFAULT_FAIRWAY,
  putting = DEFAULT_PUTTING,
  green = DEFAULT_GREEN,
  holeLabel = "Hull 4",
  holeMeta = "392 m · par 4",
  caption = "Trykk et distansebånd langs hullet for stats + treningsdata. Trykk green for å zoome inn på putting-sonene.",
}: Props) {
  const hasZoom = putting.length > 0 && green != null;
  const [zoomed, setZoomed] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const all = [...fairway, ...putting];
  const open = openId ? all.find((c) => c.id === openId) ?? null : null;

  const zoomPos = (c: HoleZone) =>
    green
      ? {
          left: `${green.x + (c.x - green.x) * ZOOM}%`,
          top: `${green.y + (c.y - green.y) * ZOOM}%`,
        }
      : { left: `${c.x}%`, top: `${c.y}%` };

  return (
    <div className="space-y-3">
      <div className="mx-auto flex w-full max-w-[440px] items-center justify-between rounded-full border border-border bg-card px-4 py-2">
        <span className="font-display text-sm font-bold tracking-tight text-foreground">{holeLabel}</span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">{holeMeta}</span>
      </div>

      <div className="relative mx-auto w-full max-w-[440px] overflow-hidden rounded-[20px] border border-border bg-coach-sidebar shadow-card">
        <Image
          src="/images/akademy/hull-ovenfra.jpg"
          alt={`${holeLabel} sett ovenfra`}
          width={1073}
          height={1600}
          priority
          unoptimized
          className="block h-auto w-full origin-center transition-transform duration-500 ease-out"
          style={{ transformOrigin: `${green?.x ?? 50}% ${green?.y ?? 50}%`, transform: zoomed ? `scale(${ZOOM})` : "scale(1)" }}
        />

        {!zoomed && (
          <>
            <svg viewBox={`0 0 100 ${100 * RATIO}`} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
              <path d={PATH} fill="none" stroke="rgb(255 255 255)" strokeWidth={0.7} strokeDasharray="1.6 1.8" strokeLinecap="round" opacity={0.85} />
            </svg>

            {fairway.map((c) => (
              <Marker key={c.id} cat={c} onClick={() => setOpenId(c.id)} style={{ left: `${c.x}%`, top: `${c.y}%` }} />
            ))}

            {hasZoom && green && (
              <button
                type="button"
                onClick={() => { setOpenId(null); setZoomed(true); }}
                aria-label="Zoom inn på green"
                className="group absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${green.x}%`, top: `${green.y}%` }}
              >
                <span className="relative flex items-center justify-center">
                  <span className="absolute inline-flex h-6 w-6 rounded-full bg-primary/30 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-coach-sidebar">
                    <Flag className="h-3.5 w-3.5" strokeWidth={2} />
                  </span>
                </span>
                <span className="absolute left-1/2 top-[calc(100%+3px)] flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-card px-2 py-0.5 shadow-card">
                  <ZoomIn className="h-2.5 w-2.5 text-primary" strokeWidth={2} />
                  <span className="font-mono text-[8px] font-extrabold uppercase tracking-[0.10em] text-primary">Green · putting</span>
                </span>
              </button>
            )}
          </>
        )}

        {zoomed && (
          <>
            {putting.map((c) => (
              <Marker key={c.id} cat={c} onClick={() => setOpenId(c.id)} style={zoomPos(c)} />
            ))}
            <button
              type="button"
              onClick={() => { setZoomed(false); setOpenId(null); }}
              className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 shadow-card"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-foreground" strokeWidth={2} />
              <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-foreground">Hele hullet</span>
            </button>
          </>
        )}

        {open && (
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-border bg-card p-4 shadow-deck">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <AthleticEyebrow>{open.sub}</AthleticEyebrow>
                <h3 className="mt-0.5 font-display text-base font-bold tracking-tight text-foreground">{open.label}</h3>
              </div>
              <button type="button" onClick={() => setOpenId(null)} aria-label="Lukk" className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Stat icon={TrendingUp} label="SG" value={fmtSg(open.sg)} good={open.sg != null ? open.sg >= 0 : undefined} />
              <Stat icon={Activity} label="Økter" value={String(open.okter)} />
              <Stat icon={Clock} label="Minutter" value={String(open.minutter)} />
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
              <div>
                <div className="font-mono text-[9px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">SG-trend</div>
                <div className="mt-0.5 font-mono text-sm font-bold tabular-nums text-foreground">
                  {open.okter} økter · {open.minutter} min
                </div>
              </div>
              {open.trend.length >= 2 ? (
                <Sparkline values={open.trend} width={96} height={32} color={open.trend[open.trend.length - 1] >= open.trend[0] ? "hsl(var(--success))" : "hsl(var(--destructive))"} />
              ) : (
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">for få data</span>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="mx-auto max-w-[440px] text-xs leading-[1.5] text-muted-foreground">{caption}</p>
    </div>
  );
}

function Marker({ cat, onClick, style }: { cat: HoleZone; onClick: () => void; style: React.CSSProperties }) {
  return (
    <button type="button" onClick={onClick} aria-label={cat.label} className="group absolute -translate-x-1/2 -translate-y-1/2" style={style}>
      <span className="relative flex items-center justify-center">
        <span className="absolute inline-flex h-5 w-5 rounded-full bg-accent/40 motion-safe:animate-ping" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-accent ring-2 ring-coach-sidebar" />
      </span>
      <span className="absolute left-1/2 top-[calc(100%+3px)] flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-card px-2 py-0.5 shadow-card">
        <span className="font-mono text-[8px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">{cat.label}</span>
        <span className={cn("font-mono text-[10px] font-bold tabular-nums", cat.sg == null ? "text-muted-foreground" : cat.sg >= 0 ? "text-success" : "text-destructive")}>{fmtSg(cat.sg)}</span>
      </span>
    </button>
  );
}

function Stat({ icon: Icon, label, value, good }: { icon: typeof Activity; label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background px-2.5 py-2">
      <div className="flex items-center gap-1 font-mono text-[8px] font-extrabold uppercase tracking-[0.06em] text-muted-foreground">
        <Icon className="h-2.5 w-2.5" strokeWidth={1.5} />{label}
      </div>
      <div className={cn("mt-1 font-mono text-base font-bold tabular-nums leading-none", good === true ? "text-success" : good === false ? "text-destructive" : "text-foreground")}>{value}</div>
    </div>
  );
}
