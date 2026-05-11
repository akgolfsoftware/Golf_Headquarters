/**
 * DEMO — Booking confirmation · kalender-loading
 * Bygd fra wireframe modaler-C/04-booking-confirmation-loading.html
 * URL: /booking-confirmation-loading-demo
 */

import {
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Download,
  Loader2,
  X,
} from "lucide-react";

const DETAILS = [
  { k: "Fasilitet", v: "Mulligan Studio 1 · matte 4", mono: false },
  { k: "Tid", v: "Tor 14. mai · 16:30–17:30", mono: true },
  { k: "Coach", v: "Anders Kristiansen", mono: false },
];

export default function BookingConfirmationLoadingDemo() {
  return (
    <div className="min-h-screen bg-foreground/80 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 px-6 pt-6 pb-2">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
            <span className="text-[#16A34A]">●</span> Bekreftet · kvittering sendt til markus@akgolf.no
          </div>
          <button
            className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </header>

        {/* Success */}
        <div className="flex flex-col items-center px-6 pt-3 pb-5 text-center">
          <div className="relative mb-3.5 grid h-16 w-16 place-items-center rounded-full bg-[#16A34A]/15 text-[#16A34A]">
            <span className="absolute -inset-1.5 rounded-full border-2 border-[#16A34A]/20" />
            <CheckCircle2 size={32} strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-[32px] italic leading-tight">
            Booking bekreftet
          </h2>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Vi legger til kalender-avtalen din nå — vent et øyeblikk.
          </p>
        </div>

        {/* Price pill */}
        <div className="mx-6 mb-4 flex items-center justify-between rounded-xl bg-primary px-5 py-3.5 text-primary-foreground">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] opacity-75">
              Belastet
            </div>
            <div className="mt-0.5 font-mono text-[22px] font-semibold tabular-nums">1 600 kr</div>
          </div>
          <div className="text-right font-mono text-[11px] opacity-80">
            Visa ****4242
            <br />
            14. mai 14:32
          </div>
        </div>

        {/* Details */}
        <div className="mx-6 mb-4 rounded-xl border border-border bg-secondary/40 px-5 py-3">
          {DETAILS.map((d, i) => (
            <div
              key={d.k}
              className={`flex items-center justify-between py-2 text-[13px] ${
                i < DETAILS.length - 1 ? "border-b border-dashed border-border" : ""
              }`}
            >
              <span className="text-muted-foreground">{d.k}</span>
              <span className={`text-right font-semibold ${d.mono ? "font-mono" : ""}`}>
                {d.v}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between border-t border-dashed border-border py-2 text-[13px]">
            <span className="text-muted-foreground">Booking-ID</span>
            <span className="inline-block rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
              #BK-2026-0421
            </span>
          </div>
        </div>

        {/* Calendar loading */}
        <div className="px-6 pb-5">
          <div className="mb-2.5 flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            <Loader2 size={11} strokeWidth={2} className="animate-spin text-primary" />
            Legger til i Google Calendar …
          </div>
          <div className="grid grid-cols-3 gap-2">
            {/* Adding */}
            <button className="relative flex items-center justify-center gap-2 overflow-hidden rounded-md border border-border bg-card px-3 py-2.5 text-[12px] font-medium text-muted-foreground">
              <Loader2 size={12} strokeWidth={2} className="animate-spin" />
              Legger til …
              <span
                className="absolute bottom-0 left-0 h-0.5 animate-pulse bg-primary"
                style={{ width: "60%" }}
              />
            </button>
            {/* Added */}
            <button className="flex items-center justify-center gap-2 rounded-md border border-[#16A34A] bg-[#16A34A]/10 px-3 py-2.5 text-[12px] font-medium text-[#16A34A]">
              <Check size={14} strokeWidth={2.5} />
              Apple · lagt til
            </button>
            {/* Idle */}
            <button className="flex items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
              <Calendar size={14} strokeWidth={1.5} />
              Outlook
            </button>
          </div>
          <p className="mt-2.5 text-center text-xs text-muted-foreground">
            Trenger du hjelp?{" "}
            <span className="text-primary underline underline-offset-2">
              Last ned .ics-fil manuelt
            </span>
          </p>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between border-t border-border bg-secondary/40 px-6 py-4">
          <button className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
            <Download size={14} strokeWidth={1.5} />
            Last ned kvittering
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            Til mine bookinger
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </footer>
      </div>
    </div>
  );
}
