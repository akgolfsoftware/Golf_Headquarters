/**
 * PILOT — RescheduleBookingModal · success
 * Bygd direkte fra wireframe/modal-C/02-reschedule-success.html
 * URL: /reschedule-success-demo
 *
 * Mock: Markus flyttet BK-2026-0421 fra tor 14. mai til fre 15. mai.
 */

import { X, ArrowRight, CheckCircle2, Check, Download } from "lucide-react";

const BACKDROP = "fixed inset-0 z-0 bg-[rgba(10,31,24,0.5)]" as const;

export default function RescheduleSuccessDemo() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className={BACKDROP} aria-hidden="true" />

      <div className="relative z-10 mx-auto my-8 w-full max-w-[560px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Head */}
        <header className="flex items-start justify-between gap-4 px-8 pb-3 pt-7">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
              <span className="text-[#1A7D56]">●</span>
              <span className="ml-1.5">Flytting bekreftet · #BK-2026-0421</span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Lukk"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </header>

        {/* Body */}
        <div className="px-8 pb-3">
          <div className="flex flex-col items-center pb-3 pt-8 text-center">
            {/* Success icon with rings */}
            <div className="relative mb-5 grid h-[72px] w-[72px] place-items-center rounded-full bg-[rgba(26,125,86,0.13)] text-[#1A7D56]">
              <span className="absolute -inset-[7px] rounded-full border-2 border-[rgba(26,125,86,0.18)]" />
              <span className="absolute -inset-[14px] rounded-full border border-[rgba(26,125,86,0.10)]" />
              <CheckCircle2 className="h-9 w-9" strokeWidth={1.5} />
            </div>

            <h2 className="mb-2.5 font-display text-[34px] italic leading-[1.1] text-foreground">
              Tiden er flyttet
            </h2>
            <p className="mb-6 max-w-[380px] text-[14px] leading-[1.55] text-muted-foreground">
              Anders har fått varsel om endringen. Vi sender deg en oppdatert
              kalender-invitasjon på e-post om noen sekunder.
            </p>

            {/* From/To card */}
            <div className="mx-auto mb-4.5 mb-5 flex w-full max-w-[440px] items-center justify-between rounded-xl border border-border bg-background px-4 py-4">
              <div className="text-left">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Fra
                </div>
                <div className="mt-0.5 font-display text-[14px] font-semibold text-foreground line-through opacity-65">
                  Tor 14. mai · 16:30
                </div>
              </div>
              <ArrowRight className="h-[18px] w-[18px] text-muted-foreground" strokeWidth={1.5} />
              <div className="text-right">
                <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-primary">
                  Til
                </div>
                <div className="mt-0.5 font-display text-[14px] font-semibold text-primary">
                  Fre 15. mai · 14:00
                </div>
              </div>
            </div>

            {/* Notify pill */}
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/[0.06] px-3.5 py-2 text-[12.5px] text-primary">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-[#B0593A] font-mono text-[9px] font-bold text-white">
                AK
              </span>
              <span>Anders varsles automatisk · venter godkjenning</span>
              <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Foot */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-8 py-4">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
            Last ned ny kvittering
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

      {/* Toast */}
      <div className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5 rounded-xl bg-foreground px-4 py-3 text-[13.5px] text-background shadow-2xl">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[#1A7D56] text-white">
          <Check className="h-3 w-3" strokeWidth={3} />
        </span>
        <span>Booking flyttet til fre 15. mai · 14:00</span>
        <button
          type="button"
          className="ml-1.5 border-b border-current font-semibold text-accent"
        >
          Angre
        </button>
        <button
          type="button"
          aria-label="Lukk toast"
          className="ml-2 text-muted-foreground"
        >
          <X className="h-3.5 w-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
