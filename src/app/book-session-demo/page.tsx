/**
 * PILOT — BookSessionModal · Steg 1 (Velg fasilitet)
 * Bygd direkte fra wireframe/design-files-v2/modaler-C/01-book-session-steg1-pro.html
 * URL: /book-session-demo
 *
 * Mock-data: Markus skal booke. 4 fasiliteter sortert på avstand. Mulligan Studio 2 valgt.
 */

import { X, ArrowRight, MapPin, Check } from "lucide-react";

const BACKDROP = "fixed inset-0 z-0 bg-[rgba(10,31,24,0.5)]" as const;

type ThumbKind = "mulligan" | "gfgk" | "bossum";

interface Facility {
  id: string;
  name: string;
  sub: string;
  location: string;
  distance: string;
  price: string;
  priceSub: string;
  priceFree?: boolean;
  thumb: ThumbKind;
  selected?: boolean;
}

const FACILITIES: Facility[] = [
  {
    id: "ms1",
    name: "Mulligan Studio 1",
    sub: "TrackMan 4 · innendørs",
    location: "Fredrikstad sentrum",
    distance: "1,2 km",
    price: "1 600 kr",
    priceSub: "/time",
    thumb: "mulligan",
  },
  {
    id: "ms2",
    name: "Mulligan Studio 2",
    sub: "TrackMan 4 · innendørs",
    location: "Fredrikstad sentrum",
    distance: "1,2 km",
    price: "1 600 kr",
    priceSub: "/time",
    thumb: "mulligan",
    selected: true,
  },
  {
    id: "gfgk",
    name: "GFGK Range",
    sub: "Utendørs range · 50 utslagsmatter",
    location: "Glommen",
    distance: "4,5 km",
    price: "Gratis",
    priceSub: "for medlemmer",
    priceFree: true,
    thumb: "gfgk",
  },
  {
    id: "bossum",
    name: "Bossum Sim-rom",
    sub: "Simulator · privatrom",
    location: "Bossum",
    distance: "8,3 km",
    price: "800 kr",
    priceSub: "/time",
    thumb: "bossum",
  },
];

const SORT_TABS: Array<{ label: string; active?: boolean; icon?: boolean }> = [
  { label: "Avstand", active: true, icon: true },
  { label: "Pris" },
  { label: "Ledighet" },
];

export default function BookSessionDemo() {
  const selected = FACILITIES.find((f) => f.selected);

  return (
    <div className="relative min-h-screen bg-background">
      <div className={BACKDROP} aria-hidden="true" />

      <div className="relative z-10 mx-auto my-8 w-full max-w-[720px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Head */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-8 pb-5 pt-7">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
              <span>Steg 1 av 3</span>
              <span className="mx-2 text-foreground/30">·</span>
              <span>Velg fasilitet</span>
            </div>
            <h2 className="mt-1.5 font-display text-[26px] font-semibold leading-tight tracking-tight text-foreground">
              Book økt
            </h2>
          </div>
          <div className="flex items-center gap-2.5">
            <StepDots active={0} total={3} />
            <button
              type="button"
              aria-label="Lukk"
              className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="px-8 py-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
              4 fasiliteter · sortert på avstand
            </span>
            <div className="flex gap-1.5">
              {SORT_TABS.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] transition-colors ${
                    t.active
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.icon && <MapPin className="h-3 w-3" strokeWidth={1.75} />}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {FACILITIES.map((f) => (
              <FacilityRow key={f.id} fac={f} />
            ))}
          </div>
        </div>

        {/* Foot */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-8 py-4">
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Avbryt
          </button>
          <div className="flex items-center gap-2.5">
            <span className="text-[12px] text-muted-foreground">
              Valgt: <b className="font-semibold text-foreground">{selected?.name}</b>
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Neste
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function StepDots({ active, total }: { active: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 w-1.5 rounded-full ${
            i === active ? "bg-primary" : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}

function FacilityRow({ fac }: { fac: Facility }) {
  const isSelected = !!fac.selected;
  return (
    <div
      className={`grid cursor-pointer grid-cols-[64px_1fr_auto] items-center gap-3.5 rounded-2xl border p-4 transition-colors ${
        isSelected
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : "border-border bg-card hover:border-muted-foreground/40"
      }`}
    >
      <Thumb kind={fac.thumb} />
      <div className="min-w-0">
        <div className="font-display text-[16px] font-semibold text-foreground">{fac.name}</div>
        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[12.5px] text-muted-foreground">
          <span>{fac.sub}</span>
          <span className="h-[3px] w-[3px] rounded-full bg-muted-foreground/60" />
          <span>{fac.location}</span>
          <span className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] font-medium text-foreground">
            {fac.distance}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-right">
          <div
            className={`font-mono text-[13px] font-semibold ${
              fac.priceFree ? "text-[#16A34A]" : "text-foreground"
            }`}
          >
            {fac.price}
          </div>
          <div className="mt-0.5 font-mono text-[10.5px] font-medium text-muted-foreground">
            {fac.priceSub}
          </div>
        </div>
        {isSelected && (
          <div className="ml-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </div>
        )}
      </div>
    </div>
  );
}

function Thumb({ kind }: { kind: ThumbKind }) {
  const styles: Record<ThumbKind, string> = {
    mulligan: "bg-gradient-to-br from-secondary to-border text-muted-foreground",
    gfgk: "bg-gradient-to-br from-[#2A4F39] to-[#1A3526] text-[#D1F843]",
    bossum: "bg-gradient-to-br from-[#3A5774] to-[#1F3045] text-[#D1F843]",
  };
  return (
    <div className={`grid h-16 w-16 place-items-center rounded-xl ${styles[kind]}`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="h-7 w-7"
      >
        <rect x="4" y="6" width="24" height="18" rx="2" />
        <path d="M4 11h24M10 24v3M22 24v3" />
        <circle cx="16" cy="17" r="2.5" />
      </svg>
    </div>
  );
}
