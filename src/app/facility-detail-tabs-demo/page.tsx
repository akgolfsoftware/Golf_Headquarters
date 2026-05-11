/**
 * PILOT — FacilityDetailModal · Oversikt (med tabs)
 * Bygd direkte fra wireframe/modal-C/03-facility-detail-oversikt.html
 * URL: /facility-detail-tabs-demo
 *
 * Mock-data: Mulligan Studio 1, Storgata 12 Fredrikstad. Oversikt-tab aktiv.
 */

import { X, Clock, Wrench, Calendar, Star, MapPin, ArrowRight } from "lucide-react";

const BACKDROP = "fixed inset-0 z-0 bg-[rgba(10,31,24,0.5)]" as const;

type TabKey = "oversikt" | "utstyr" | "tider" | "anmeldelser";

interface Tab {
  key: TabKey;
  label: string;
  icon: typeof Clock;
  count?: number;
}

const TABS: Tab[] = [
  { key: "oversikt", label: "Oversikt", icon: Clock },
  { key: "utstyr", label: "Utstyr", icon: Wrench },
  { key: "tider", label: "Tider", icon: Calendar },
  { key: "anmeldelser", label: "Anmeldelser", icon: Star, count: 32 },
];

const ACTIVE: TabKey = "oversikt";

export default function FacilityDetailTabsDemo() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className={BACKDROP} aria-hidden="true" />

      <div className="relative z-10 mx-auto my-8 w-full max-w-[720px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Hero */}
        <div className="relative flex h-60 items-end bg-gradient-to-br from-[#1A3526] via-[#2A4F39] to-[#3D6E54] px-6 pb-4 pt-5 text-white">
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 70% 30%,rgba(209,248,67,0.18),transparent 60%)",
            }}
            aria-hidden="true"
          />
          <svg
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="absolute right-6 top-6 h-16 w-16 text-accent/40"
          >
            <rect x="8" y="14" width="48" height="32" rx="3" />
            <path d="M8 24h48M18 46v6M46 46v6" />
            <circle cx="32" cy="30" r="5" />
          </svg>
          <span className="relative inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold tracking-[0.04em] backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3CE89A]" />
            Åpent nå · stenger 22:00
          </span>
        </div>

        {/* Head */}
        <header className="flex items-start justify-between gap-4 px-8 pb-3 pt-6">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
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
        <div className="flex gap-0 border-b border-border px-6">
          {TABS.map((t) => {
            const Icon = t.icon;
            const isActive = t.key === ACTIVE;
            return (
              <button
                key={t.key}
                type="button"
                className={`-mb-px flex items-center gap-1.5 border-b-2 px-4 py-3 text-[13.5px] font-medium transition-colors ${
                  isActive
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {t.label}
                {t.count !== undefined && (
                  <span className="font-mono text-[10.5px] text-muted-foreground/60">
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="px-8 py-6">
          {/* Price card */}
          <div className="mb-4 flex items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4">
            <div>
              <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-primary">
                Pris
              </div>
              <div className="mt-0.5 flex items-baseline gap-1.5 font-mono text-[30px] font-semibold leading-none text-foreground">
                1 600 kr
                <span className="font-sans text-[14px] font-medium text-muted-foreground">
                  /time
                </span>
              </div>
              <div className="mt-1 text-[12.5px] text-primary">
                Inkluderer TrackMan-data, video-replay og kaffe
              </div>
            </div>
            <button
              type="button"
              className="inline-flex flex-shrink-0 items-center rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Se pakker
            </button>
          </div>

          <p className="mb-4 text-[14px] leading-[1.55] text-foreground">
            Fredrikstads mest brukte indoor-studio. To matter på TrackMan 4 med Mevo+
            for sidekamera. Caféen serverer god kaffe og enkel lunsj, og det er fri
            parkering bak bygget.
          </p>

          {/* Stats */}
          <div className="mb-4 grid grid-cols-3 gap-3">
            <StatCard label="Vurdering" value="4,8" stars sub="32 anmeldelser" />
            <StatCard label="Booket 2026" value="127" sub="økter hittil i år" />
            <StatCard label="Belegg neste 7 d." value="68 %" sub="jevn pågang" />
          </div>

          {/* Adresse */}
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5">
            <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="h-4 w-4" strokeWidth={1.75} />
            </div>
            <div className="text-[13.5px]">
              <b className="block font-semibold text-foreground">
                Storgata 12, 1607 Fredrikstad
              </b>
              <span className="mt-0.5 block font-mono text-[12px] text-muted-foreground">
                Fri parkering bak bygget · 2 min fra togstasjon
              </span>
            </div>
            <a
              href="#"
              className="ml-auto border-b border-current text-[12.5px] font-semibold text-primary"
            >
              Vis på kart →
            </a>
          </div>
        </div>

        {/* Foot */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-8 py-4">
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Lukk
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
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

function StatCard({
  label,
  value,
  sub,
  stars,
}: {
  label: string;
  value: string;
  sub: string;
  stars?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3.5">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5 font-mono text-[20px] font-semibold leading-none -tracking-[0.01em]">
        {value}
        {stars && (
          <span className="text-[13px] tracking-[-1px] text-[#F4C430]">★★★★★</span>
        )}
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}
