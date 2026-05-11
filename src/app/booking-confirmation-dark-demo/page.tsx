/**
 * DEMO — BookingConfirmationModal · Dark
 * Bygd fra wireframe modal-C/04-booking-confirmation-dark.html
 * URL: /booking-confirmation-dark-demo
 */

import { ArrowRight, Calendar, CheckCircle2, Download, X } from "lucide-react";

const PREP_STEPS = [
  "Møt opp 5 min før — resepsjonen åpner døren til Studio 1.",
  "Logg inn på skjermen med din AK Golf-konto — TrackMan starter automatisk.",
  "Kaffe og vann står på pulten bak. Ekstra ball-kurver kostnadsfritt.",
] as const;

const DETAILS = [
  { k: "Fasilitet", v: "Mulligan Studio 1 · matte 4", mono: false },
  { k: "Tid", v: "Tor 14. mai · 16:30–17:30", mono: true },
  { k: "Coach", v: "Anders Kristiansen", mono: false },
] as const;

export default function BookingConfirmationDarkDemo() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="fixed inset-0 z-0 bg-black/60" aria-hidden="true" />

      <div className="relative z-10 mx-auto my-8 w-full max-w-[560px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Head */}
        <header className="flex items-start justify-between gap-4 px-7 pb-3 pt-6">
          <div className="font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
            <span className="text-[#3CE89A]">●</span>
            <span className="ml-2">Bekreftet · kvittering sendt til markus@akgolf.no</span>
          </div>
          <button
            type="button"
            aria-label="Lukk"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </header>

        <div className="px-7 pt-2 pb-6">
          {/* Success */}
          <div className="flex flex-col items-center pb-5 pt-3 text-center">
            <div className="relative mb-3.5 grid h-16 w-16 place-items-center rounded-full bg-[#1A7D56]/15 text-[#3CE89A]">
              <span
                className="absolute rounded-full border-2 border-[#1A7D56]/20"
                style={{ inset: "-6px" }}
              />
              <CheckCircle2 className="h-8 w-8" strokeWidth={1.75} />
            </div>
            <h2 className="font-display text-[32px] italic leading-tight text-foreground">
              Booking bekreftet
            </h2>
            <p className="mt-2 text-[13.5px] text-muted-foreground">
              Vi har sendt deg detaljer og kalender-invitasjon — Anders får varsel.
            </p>
          </div>

          {/* Price pill */}
          <div className="mb-5 flex items-center justify-between rounded-xl bg-primary px-4 py-3.5 text-primary-foreground">
            <div>
              <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] opacity-75">
                Belastet
              </div>
              <div className="mt-0.5 font-mono text-[22px] font-semibold tabular-nums">
                1 600 kr
              </div>
            </div>
            <div className="text-right font-mono text-[11.5px] opacity-80">
              Visa ****4242
              <br />
              14. mai 14:32
            </div>
          </div>

          {/* Details */}
          <div className="mb-5 rounded-2xl border border-border bg-secondary/40 px-5 py-2">
            {DETAILS.map((d) => (
              <div
                key={d.k}
                className="flex items-center justify-between border-b border-dashed border-border/60 py-2 text-[13.5px] last:border-b-0"
              >
                <span className="text-muted-foreground">{d.k}</span>
                <span
                  className={`text-right font-semibold ${
                    d.mono ? "font-mono tabular-nums" : ""
                  }`}
                >
                  {d.v}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between border-b border-dashed border-border/60 py-2 text-[13.5px]">
              <span className="text-muted-foreground">Adresse</span>
              <span className="text-right font-semibold">
                Storgata 12 ·{" "}
                <button
                  type="button"
                  className="border-b border-primary text-primary"
                >
                  vis kart
                </button>
              </span>
            </div>
            <div className="flex items-center justify-between py-2 text-[13.5px]">
              <span className="text-muted-foreground">Booking-ID</span>
              <span className="inline-block rounded-sm bg-secondary px-2 py-0.5 font-mono text-[11.5px] text-muted-foreground">
                #BK-2026-0421
              </span>
            </div>
          </div>

          {/* Prep */}
          <div className="mb-5">
            <div className="mb-2.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Slik kommer du i gang
            </div>
            <div className="flex flex-col gap-2">
              {PREP_STEPS.map((step, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2.5 rounded-md border border-border bg-secondary/40 px-3 py-2.5 text-[13px] text-foreground"
                >
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent font-mono text-[11px] font-bold text-accent-foreground">
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div>
            <div className="mb-2.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Legg til i kalender
            </div>
            <div className="grid grid-cols-3 gap-2">
              <CalendarButton label="Google" />
              <CalendarButton label="Apple" />
              <CalendarButton label="Outlook" />
            </div>
          </div>
        </div>

        {/* Foot */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-7 py-4">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
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

function CalendarButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card px-3 py-2.5 text-[12.5px] font-medium text-foreground transition-colors hover:border-muted-foreground"
    >
      <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
      {label}
    </button>
  );
}
