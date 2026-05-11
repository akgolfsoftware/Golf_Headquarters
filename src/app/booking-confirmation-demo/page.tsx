/**
 * PILOT — BookingConfirmationModal
 * Bygd direkte fra wireframe/design-files-v2/modaler-C/04-booking-confirmation.html
 * URL: /booking-confirmation-demo
 *
 * Mock-data: Booking #BK-2026-0421 bekreftet — Markus hos Anders, Mulligan Studio 2, tor 14. mai.
 */

import { X, CheckCircle2, ArrowRight, Download, Calendar } from "lucide-react";

const BACKDROP = "fixed inset-0 z-0 bg-[rgba(10,31,24,0.5)]" as const;

const PREP_STEPS = [
  "Møt opp 5 min før — resepsjonen åpner døren til Studio 2.",
  "Logg inn på skjermen med din AK Golf-konto — TrackMan starter automatisk.",
  "Kaffe og vann står på pulten bak. Ekstra ball-kurver kostnadsfritt.",
];

const CAL_BTNS = [
  { label: "Google", color: "#1A73E8" },
  { label: "Apple", color: "currentColor" },
  { label: "Outlook", color: "currentColor" },
];

export default function BookingConfirmationDemo() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className={BACKDROP} aria-hidden="true" />

      <div className="relative z-10 mx-auto my-8 w-full max-w-[560px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Head */}
        <header className="flex items-start justify-between gap-4 px-8 pb-3 pt-7">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
            <span className="text-[#16A34A]">●</span>
            <span className="ml-1.5">Bekreftet · kvittering sendt til markus@akgolf.no</span>
          </div>
          <button
            type="button"
            aria-label="Lukk"
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </header>

        {/* Body */}
        <div className="px-8 pb-2 pt-2">
          {/* Success */}
          <div className="flex flex-col items-center py-3 pb-4 text-center">
            <div className="relative grid h-16 w-16 place-items-center rounded-full bg-[rgba(22,163,74,0.13)] text-[#16A34A]">
              <span className="absolute -inset-1.5 rounded-full border-2 border-[rgba(22,163,74,0.20)]" />
              <CheckCircle2 className="h-8 w-8" strokeWidth={1.75} />
            </div>
            <h2 className="mt-3.5 font-display text-[32px] italic leading-tight text-foreground">
              Booking bekreftet
            </h2>
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              Vi har sendt deg detaljer og kalender-invitasjon — Anders får varsel.
            </p>
          </div>

          {/* Price pill */}
          <div className="mb-4 flex items-center justify-between rounded-xl bg-primary px-4.5 py-3.5 text-primary-foreground">
            <div>
              <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] opacity-75">
                Belastet
              </div>
              <div className="mt-0.5 font-mono text-[22px] font-semibold">1 600 kr</div>
            </div>
            <div className="text-right font-mono text-[11.5px] leading-relaxed opacity-80">
              Visa ****4242
              <br />
              14. mai 14:32
            </div>
          </div>

          {/* Details */}
          <div className="mb-4 rounded-2xl border border-border bg-background px-5 py-3">
            <DetRow k="Fasilitet" v="Mulligan Studio 2 · matte 4" />
            <DetRow k="Tid" v="Tor 14. mai · 16:30–17:30" mono />
            <DetRow k="Coach" v="Anders Kristiansen" />
            <DetRow
              k="Adresse"
              v={
                <span>
                  Storgata 12 ·{" "}
                  <a href="#" className="border-b border-primary/60 text-primary">
                    vis kart
                  </a>
                </span>
              }
            />
            <DetRow
              k="Booking-ID"
              v={
                <span className="inline-block rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-[11.5px] text-muted-foreground">
                  #BK-2026-0421
                </span>
              }
              last
            />
          </div>

          {/* Prep */}
          <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Slik kommer du i gang
          </div>
          <div className="mb-4 mt-2.5 flex flex-col gap-2">
            {PREP_STEPS.map((step, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 rounded-md border border-border bg-background px-3 py-2.5 text-[13px] text-foreground"
              >
                <div className="grid h-5.5 w-5.5 flex-shrink-0 place-items-center rounded-full bg-accent font-mono text-[11px] font-bold text-accent-foreground" style={{width:22,height:22}}>
                  {i + 1}
                </div>
                <span>{step}</span>
              </div>
            ))}
          </div>

          {/* Calendar */}
          <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Legg til i kalender
          </div>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {CAL_BTNS.map((b) => (
              <button
                key={b.label}
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-[12.5px] font-medium text-foreground transition-colors hover:border-foreground"
              >
                <Calendar
                  className="h-3.5 w-3.5"
                  strokeWidth={1.75}
                  style={{ color: b.color }}
                />
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Foot */}
        <footer className="mt-4 flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-8 py-4">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
            Last ned kvittering
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Til mine bookinger
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        </footer>
      </div>
    </div>
  );
}

function DetRow({
  k,
  v,
  mono,
  last,
}: {
  k: string;
  v: React.ReactNode;
  mono?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 py-2 text-[13.5px] ${
        last ? "" : "border-b border-dashed border-border/70"
      }`}
    >
      <span className="text-muted-foreground">{k}</span>
      <span
        className={`text-right font-semibold text-foreground ${mono ? "font-mono" : ""}`}
      >
        {v}
      </span>
    </div>
  );
}
