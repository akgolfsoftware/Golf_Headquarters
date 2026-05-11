/**
 * DEMO — FacilityDetailModal · Dark
 * Bygd fra wireframe modal-C/03-facility-detail-dark.html
 * URL: /facility-detail-dark-demo
 */

import {
  ArrowRight,
  Calendar,
  CheckCheck,
  Clock,
  MapPin,
  Star,
  X,
} from "lucide-react";

const TABS = [
  { label: "Oversikt", icon: Clock, active: true },
  { label: "Utstyr", icon: CheckCheck, active: false },
  { label: "Tider", icon: Calendar, active: false },
  { label: "Anmeldelser", icon: Star, active: false, count: 32 },
] as const;

export default function FacilityDetailDarkDemo() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 z-0 bg-black/60" aria-hidden="true" />

      <div className="relative z-10 mx-auto my-8 w-full max-w-[720px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Hero */}
        <div
          className="relative flex h-[240px] items-end px-6 py-5 text-white"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #1A3526 0%, #2A4F39 60%, #3D6E54 100%)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 70% 30%, rgba(209,248,67,0.18), transparent 60%)",
            }}
          />
          <svg
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="absolute right-6 top-6 h-16 w-16"
            style={{ color: "rgba(209,248,67,0.40)" }}
          >
            <rect x="8" y="14" width="48" height="32" rx="3" />
            <path d="M8 24h48M18 46v6M46 46v6" />
            <circle cx="32" cy="30" r="5" />
          </svg>
          <span
            className="relative inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-[0.04em]"
            style={{ backgroundColor: "rgba(255,255,255,0.14)", backdropFilter: "blur(8px)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: "#3CE89A" }}
            />
            Åpent nå · stenger 22:00
          </span>
        </div>

        {/* Head (no border bottom) */}
        <header className="flex items-start justify-between gap-4 px-7 pb-3 pt-6">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
              <span>Storgata 12 · Fredrikstad</span>
              <span className="mx-2 text-foreground/30">·</span>
              <span>1,2 km unna</span>
            </div>
            <h2 className="mt-1.5 font-display text-[26px] font-semibold leading-tight tracking-tight text-foreground">
              Mulligan Studio 1
            </h2>
          </div>
          <button
            type="button"
            aria-label="Lukk"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </header>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border bg-card px-7">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.label}
                type="button"
                className={`-mb-px inline-flex items-center gap-1.5 border-b-2 px-4 py-3 text-[13.5px] font-medium transition-colors ${
                  t.active
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {t.label}
                {"count" in t && t.count !== undefined && (
                  <span className="font-mono text-[10.5px] text-muted-foreground">
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          {/* Price card */}
          <div className="mb-5 flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/10 px-5 py-4">
            <div>
              <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-primary">
                Pris
              </div>
              <div className="mt-1 font-mono text-[30px] font-semibold leading-none tabular-nums text-foreground">
                1 600 kr
                <span className="ml-1 font-sans text-sm font-medium text-muted-foreground">
                  /time
                </span>
              </div>
              <div className="mt-1.5 text-[12.5px] text-primary">
                Inkluderer TrackMan-data, video-replay og kaffe
              </div>
            </div>
            <button
              type="button"
              className="rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Se pakker
            </button>
          </div>

          {/* Description */}
          <p className="mb-5 text-[14px] leading-relaxed text-foreground text-pretty">
            Fredrikstads mest brukte indoor-studio. To matter på TrackMan 4 med Mevo+ for
            sidekamera. Caféen serverer god kaffe og enkel lunsj, og det er fri parkering
            bak bygget.
          </p>

          {/* Stats */}
          <div className="mb-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card px-4 py-3.5">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                Vurdering
              </div>
              <div className="mt-1 flex items-baseline gap-1.5 font-mono text-[20px] font-semibold tabular-nums">
                4,8
                <span className="text-[13px] tracking-tighter text-amber-400">★★★★★</span>
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">32 anmeldelser</div>
            </div>
            <div className="rounded-xl border border-border bg-card px-4 py-3.5">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                Booket 2026
              </div>
              <div className="mt-1 font-mono text-[20px] font-semibold tabular-nums">127</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">økter hittil i år</div>
            </div>
            <div className="rounded-xl border border-border bg-card px-4 py-3.5">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                Belegg neste 7 d.
              </div>
              <div className="mt-1 font-mono text-[20px] font-semibold tabular-nums">68 %</div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">jevn pågang</div>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
              <MapPin className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 text-[13.5px]">
              <b className="block font-semibold text-foreground">
                Storgata 12, 1607 Fredrikstad
              </b>
              <span className="mt-0.5 block font-mono text-[12.5px] text-muted-foreground">
                Fri parkering bak bygget · 2 min fra togstasjon
              </span>
            </div>
            <button
              type="button"
              className="ml-auto border-b border-primary text-[12.5px] font-semibold text-primary"
            >
              Vis på kart →
            </button>
          </div>
        </div>

        {/* Foot */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-7 py-4">
          <button
            type="button"
            className="rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            Lukk
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Del
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Book her
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
