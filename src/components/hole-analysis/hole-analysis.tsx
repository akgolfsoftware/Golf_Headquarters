"use client";

import { useState } from "react";
import Image from "next/image";
import { X, TrendingUp, Target, Activity, Flag, ArrowLeft, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { Sparkline } from "@/components/athletic/sparkline";

/* ─────────────────────────────────────────────────────────────────────────
   Hull-analyse — TOP-DOWN på ekte foto.
   Fairway-markører ligger på distansebåndene (200+ → 50-100) langs shot-pathen
   fra tee (nederst) til green (øverst-høyre). Green-markøren ZOOMER inn på
   green og viser putting-/nærspill-kategoriene (nærspill 0-50, lag-putt,
   putt 0-3 fot). Trykk en kategori → SG + treningsdata.

   Foto: public/images/akademy/hull-ovenfra.jpg (1073×1600, ratio 1.491).
   Markør-posisjon: x/y i % av rammen. Zoom: image scale(ZOOM) med
   transform-origin i green-senter; putting-markørene re-beregnes til zoomede
   koordinater (origin + (p − origin) × ZOOM) så de følger bildet.
   ───────────────────────────────────────────────────────────────────────── */

const RATIO = 1.491; // 1600 / 1073
const GREEN = { x: 69, y: 18 }; // green-senter i % (zoom-origin)
const ZOOM = 2.8;

// Shot-path langs fairway-senterlinjen (punkt = x, y×RATIO).
const PATH = "M43 119.3 Q44 107 46 95.4 Q47 86 49 77.5 Q52 69 55 61.1 Q58 53 62 44.7 Q65 36 69 26.8";

type Cat = {
  id: string;
  label: string;
  sub: string;
  x: number; // % horisontalt
  y: number; // % vertikalt
  sg: number;
  hit: { label: string; value: string };
  attempts: string;
  okter: number;
  slag: number;
  trend: number[];
};

const FAIRWAY: Cat[] = [
  { id: "tee", label: "Tee total", sub: "Driver · snitt 248 m", x: 43, y: 80, sg: 0.31, hit: { label: "Fairway", value: "64 %" }, attempts: "28 slag", okter: 8, slag: 142, trend: [3, 4, 3, 5, 6, 5, 7, 8] },
  { id: "b200", label: "200+", sub: "Innspill · 3-tre / hybrid", x: 46, y: 64, sg: -0.12, hit: { label: "GIR", value: "29 %" }, attempts: "14 slag", okter: 4, slag: 36, trend: [4, 3, 4, 3, 2, 3, 3, 2] },
  { id: "b150", label: "150–200", sub: "Innspill · 5–7 jern", x: 49, y: 52, sg: 0.08, hit: { label: "GIR", value: "48 %" }, attempts: "31 slag", okter: 6, slag: 88, trend: [3, 4, 4, 5, 4, 6, 5, 6] },
  { id: "b100", label: "100–150", sub: "Innspill · 8-jern – PW", x: 55, y: 41, sg: 0.22, hit: { label: "GIR", value: "61 %" }, attempts: "44 slag", okter: 9, slag: 156, trend: [4, 5, 5, 6, 6, 7, 7, 8] },
  { id: "b50", label: "50–100", sub: "Innspill · wedge", x: 62, y: 30, sg: 0.05, hit: { label: "GIR", value: "68 %" }, attempts: "38 slag", okter: 7, slag: 124, trend: [3, 4, 5, 5, 6, 6, 6, 7] },
];

// Putting-/nærspill-kategorier — posisjon i original-% på green (vises ved zoom).
const PUTTING: Cat[] = [
  { id: "naer", label: "Nærspill 0–50", sub: "Chip / pitch", x: 64, y: 23, sg: 0.02, hit: { label: "≤ 2 m", value: "52 %" }, attempts: "89 slag", okter: 8, slag: 300, trend: [4, 4, 5, 5, 6, 5, 6, 7] },
  { id: "lag", label: "Lag-putt", sub: "> 5 m", x: 69, y: 18, sg: 0.11, hit: { label: "≤ 1 m", value: "74 %" }, attempts: "61 slag", okter: 6, slag: 180, trend: [5, 5, 6, 6, 7, 6, 7, 8] },
  { id: "putt", label: "Putt 0–3 fot", sub: "Kortputt", x: 72, y: 14, sg: 0.18, hit: { label: "Hullet", value: "96 %" }, attempts: "120 slag", okter: 9, slag: 240, trend: [6, 7, 7, 8, 8, 8, 9, 9] },
];

const fmtSg = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(2).replace(".", ",")}`;

// Skjerm-posisjon for en putting-markør når green er zoomet inn.
const zoomPos = (c: Cat) => ({
  left: `${GREEN.x + (c.x - GREEN.x) * ZOOM}%`,
  top: `${GREEN.y + (c.y - GREEN.y) * ZOOM}%`,
});

export function HoleAnalysis() {
  const [zoomed, setZoomed] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const all = [...FAIRWAY, ...PUTTING];
  const open = openId ? all.find((c) => c.id === openId) ?? null : null;

  const backToHole = () => {
    setZoomed(false);
    setOpenId(null);
  };

  return (
    <div className="space-y-3">
      {/* Hull-header */}
      <div className="mx-auto flex w-full max-w-[440px] items-center justify-between rounded-full border border-border bg-card px-4 py-2">
        <span className="font-display text-sm font-bold tracking-tight text-foreground">Hull 4</span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">392 m · par 4</span>
      </div>

      <div className="relative mx-auto w-full max-w-[440px] overflow-hidden rounded-[20px] border border-border bg-coach-sidebar shadow-card">
        <Image
          src="/images/akademy/hull-ovenfra.jpg"
          alt="Hull 4 sett ovenfra"
          width={1073}
          height={1600}
          priority
          className="block h-auto w-full origin-center transition-transform duration-500 ease-out"
          style={{ transformOrigin: `${GREEN.x}% ${GREEN.y}%`, transform: zoomed ? `scale(${ZOOM})` : "scale(1)" }}
        />

        {/* Shot-path + fairway-markører (kun i hel-hull-visning) */}
        {!zoomed && (
          <>
            <svg viewBox={`0 0 100 ${100 * RATIO}`} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
              <path d={PATH} fill="none" stroke="rgb(255 255 255)" strokeWidth={0.7} strokeDasharray="1.6 1.8" strokeLinecap="round" opacity={0.85} />
            </svg>

            {FAIRWAY.map((c) => (
              <Marker key={c.id} cat={c} onClick={() => setOpenId(c.id)} style={{ left: `${c.x}%`, top: `${c.y}%` }} />
            ))}

            {/* Green-markør → zoom inn */}
            <button
              type="button"
              onClick={() => { setOpenId(null); setZoomed(true); }}
              aria-label="Zoom inn på green"
              className="group absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${GREEN.x}%`, top: `${GREEN.y}%` }}
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
          </>
        )}

        {/* Zoomet green: putting-markører + tilbake-knapp */}
        {zoomed && (
          <>
            {PUTTING.map((c) => (
              <Marker key={c.id} cat={c} onClick={() => setOpenId(c.id)} style={zoomPos(c)} />
            ))}

            <button
              type="button"
              onClick={backToHole}
              className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 shadow-card"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-foreground" strokeWidth={2} />
              <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-foreground">Hele hullet</span>
            </button>
          </>
        )}

        {/* Drill-down */}
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
              <Stat icon={TrendingUp} label="SG" value={fmtSg(open.sg)} good={open.sg >= 0} />
              <Stat icon={Target} label={open.hit.label} value={open.hit.value} />
              <Stat icon={Activity} label="Forsøk" value={open.attempts} />
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
              <div>
                <div className="font-mono text-[9px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">Trening · 30 d</div>
                <div className="mt-0.5 font-mono text-sm font-bold tabular-nums text-foreground">{open.okter} økter · {open.slag} slag</div>
              </div>
              <Sparkline values={open.trend} width={96} height={32} />
            </div>
          </div>
        )}
      </div>

      <p className="mx-auto max-w-[440px] text-xs leading-[1.5] text-muted-foreground">
        Trykk et distansebånd langs hullet for stats + treningsdata. Trykk green for å zoome inn på putting-sonene.
      </p>
    </div>
  );
}

function Marker({ cat, onClick, style }: { cat: Cat; onClick: () => void; style: React.CSSProperties }) {
  return (
    <button type="button" onClick={onClick} aria-label={cat.label} className="group absolute -translate-x-1/2 -translate-y-1/2" style={style}>
      <span className="relative flex items-center justify-center">
        <span className="absolute inline-flex h-5 w-5 rounded-full bg-accent/40 motion-safe:animate-ping" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-accent ring-2 ring-coach-sidebar" />
      </span>
      <span className="absolute left-1/2 top-[calc(100%+3px)] flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-card px-2 py-0.5 shadow-card">
        <span className="font-mono text-[8px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">{cat.label}</span>
        <span className={cn("font-mono text-[10px] font-bold tabular-nums", cat.sg >= 0 ? "text-success" : "text-destructive")}>{fmtSg(cat.sg)}</span>
      </span>
    </button>
  );
}

function Stat({ icon: Icon, label, value, good }: { icon: typeof Target; label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background px-2.5 py-2">
      <div className="flex items-center gap-1 font-mono text-[8px] font-extrabold uppercase tracking-[0.06em] text-muted-foreground">
        <Icon className="h-2.5 w-2.5" strokeWidth={1.5} />{label}
      </div>
      <div className={cn("mt-1 font-mono text-base font-bold tabular-nums leading-none", good ? "text-success" : "text-foreground")}>{value}</div>
    </div>
  );
}
