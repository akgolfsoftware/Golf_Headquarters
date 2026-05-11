/**
 * Booking — Anlegg-velger (steg 2 av 5, facility-variant)
 * Bygd fra wireframe/design-files-v2/screens/booking/05-booking-anlegg.html
 * URL: /booking-anlegg-demo
 *
 * Anlegg-oversikt forbruker. Liste-view. 3 anlegg med avstand fra forbrukers posisjon.
 */

import { MapPin, Clock, List, Map as MapIcon, ChevronDown, ChevronRight, Target } from "lucide-react";

const STEPS = [
  { num: "✓", label: "Tjeneste", state: "done" as const },
  { num: "2", label: "Anlegg", state: "active" as const },
  { num: "3", label: "Tid", state: "todo" as const },
  { num: "4", label: "Sammendrag", state: "todo" as const },
  { num: "5", label: "Betaling", state: "todo" as const },
];

interface Facility {
  id: string;
  name: string;
  address: string;
  distance: string;
  hours: string;
  hasTrackman: boolean;
  badge: string;
  thumb: "mulligan" | "bossum" | "gfgk";
}

const FACILITIES: Facility[] = [
  {
    id: "mulligan",
    name: "Mulligan Indoor Borre",
    address: "Stabburveien 7, 3186 Horten",
    distance: "2,4 km",
    hours: "06:00 — 22:00",
    hasTrackman: true,
    badge: "Indoor · 6 bays",
    thumb: "mulligan",
  },
  {
    id: "bossum",
    name: "GFGK Bossum",
    address: "Bossumveien 14, 1640 Råde",
    distance: "12,8 km",
    hours: "08:00 — 20:00",
    hasTrackman: false,
    badge: "Utendørs · 18 hull",
    thumb: "bossum",
  },
  {
    id: "gfgk-range",
    name: "GFGK Range",
    address: "Sportsveien 3, 1611 Fredrikstad",
    distance: "4,1 km",
    hours: "09:00 — 21:00",
    hasTrackman: false,
    badge: "Range · 24 stasjoner",
    thumb: "gfgk",
  },
];

export default function BookingAnleggDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopNav />
      <ProgressBar />

      <div className="mx-auto max-w-[1000px] px-12 pb-16 pt-12">
        <div className="text-center">
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            TrackMan-økt selvspill · 60 min · 300 kr
          </div>
          <h1 className="mt-3 font-display text-[44px] font-normal leading-tight tracking-tight">
            Velg <em className="italic text-primary">anlegg</em>
          </h1>
          <p className="mt-3 text-[15px] text-muted-foreground">
            3 anlegg å velge mellom. Avstander beregnet fra din posisjon.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex rounded-full border border-border bg-secondary/40 p-1">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 text-[13px] font-medium text-foreground shadow-sm"
            >
              <List className="h-3.5 w-3.5" strokeWidth={1.5} />
              Liste
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground"
            >
              <MapIcon className="h-3.5 w-3.5" strokeWidth={1.5} />
              Kart
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Filter:
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-1.5 text-[12px] font-medium hover:border-foreground"
            >
              Avstand: Alle
              <ChevronDown className="h-3 w-3" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              className="rounded-full border border-border bg-card px-3.5 py-1.5 text-[12px] font-medium hover:border-foreground"
            >
              Åpent nå
            </button>
            <button
              type="button"
              className="rounded-full border border-border bg-card px-3.5 py-1.5 text-[12px] font-medium hover:border-foreground"
            >
              Med TrackMan
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4">
          {FACILITIES.map((f) => (
            <FacilityRow key={f.id} fac={f} />
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}

function TopNav() {
  return (
    <nav className="flex h-16 items-center justify-between border-b border-border px-12">
      <div className="flex items-center gap-2 text-[13px] font-medium">
        <span className="h-2 w-2 rounded-full bg-primary" />
        <span>AK Golf</span>
        <span className="text-border">·</span>
        <span className="text-muted-foreground">Booking</span>
      </div>
      <a href="#" className="text-[13px] font-medium hover:text-primary">
        Min side →
      </a>
    </nav>
  );
}

function ProgressBar() {
  return (
    <div className="flex items-center justify-center gap-3 border-b border-border bg-secondary/40 px-12 py-4">
      {STEPS.map((step, i) => (
        <div key={step.label} className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-medium ${
              step.state === "active"
                ? "bg-primary text-primary-foreground"
                : step.state === "done"
                  ? "text-foreground"
                  : "text-muted-foreground"
            }`}
          >
            <span
              className={`grid h-5 w-5 place-items-center rounded-full font-mono text-[10px] ${
                step.state === "active"
                  ? "bg-primary-foreground/20"
                  : step.state === "done"
                    ? "bg-primary/10 text-primary"
                    : "bg-secondary"
              }`}
            >
              {step.num}
            </span>
            {step.label}
          </span>
          {i < STEPS.length - 1 && <span className="text-border">→</span>}
        </div>
      ))}
    </div>
  );
}

function FacilityRow({ fac }: { fac: Facility }) {
  const thumbBg: Record<Facility["thumb"], string> = {
    mulligan: "bg-gradient-to-br from-[#005840] to-[#1a7d56]",
    bossum: "bg-gradient-to-br from-[#2d5a3d] to-[#b8852a]",
    gfgk: "bg-gradient-to-br from-[#1F4C40] to-[#d1f843]",
  };
  return (
    <button
      type="button"
      className="group flex items-stretch gap-6 rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-primary"
    >
      <div
        className={`relative h-36 w-36 flex-shrink-0 overflow-hidden rounded-xl ${thumbBg[fac.thumb]}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-black/10" />
        <span className="absolute bottom-2 left-3 font-mono text-[10px] uppercase tracking-[0.1em] text-white">
          {fac.badge}
        </span>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="mb-1.5 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-[26px] font-normal italic leading-tight tracking-tight">
              {fac.name}
            </h3>
            <div className="mt-1 text-[13px] text-muted-foreground">{fac.address}</div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-[#E8F5E9] px-3 py-1 text-[11px] font-semibold text-[#16A34A]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
            Åpent nå
          </span>
        </div>
        <div className="mt-auto flex items-center gap-5 border-t border-border pt-3 text-[12px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
            <b className="font-mono font-medium text-foreground">{fac.distance}</b>{" "}
            unna
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
            <b className="font-mono font-medium text-foreground">{fac.hours}</b>
          </span>
          {fac.hasTrackman ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/40 px-2.5 py-1 font-mono text-[10px] font-medium text-foreground">
              <Target className="h-3 w-3" strokeWidth={1.5} />
              TrackMan v4
            </span>
          ) : (
            <span className="text-muted-foreground/70">Ingen TrackMan</span>
          )}
        </div>
      </div>
      <ChevronRight
        className="h-5 w-5 self-center text-primary transition-transform group-hover:translate-x-0.5"
        strokeWidth={1.5}
      />
    </button>
  );
}

function Footer() {
  return (
    <footer className="flex items-center justify-between border-t border-border px-12 py-5">
      <button
        type="button"
        className="rounded-md border border-border bg-transparent px-4 py-2 text-[13px] font-medium hover:bg-secondary"
      >
        ← Tilbake
      </button>
      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
        Klikk et anlegg for å fortsette
      </span>
    </footer>
  );
}
