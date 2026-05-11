/**
 * DEMO — Payment error-state
 * Bygd fra wireframe live-states/e6-payment-error.html
 * URL: /payment-error-demo
 */

import {
  AlertTriangle,
  ArrowRight,
  Info,
  LifeBuoy,
  Lock,
  X,
} from "lucide-react";

export default function PaymentErrorDemo() {
  return (
    <div className="min-h-screen bg-foreground/80 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <header className="flex items-start justify-between gap-6 border-b border-border px-6 pt-6 pb-5">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Steg 2 av 2 · Pro · år
            </div>
            <h1 className="mt-1.5 font-display text-[32px] font-semibold leading-tight tracking-tight">
              Bekreft <em className="italic">betaling</em>
            </h1>
          </div>
          <button
            className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </header>

        {/* Steps */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-4">
          <div className="inline-flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary font-mono text-xs font-semibold text-primary-foreground">
              1
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              Velg plan
            </span>
          </div>
          <span className="h-px flex-1 bg-primary/40" />
          <div className="inline-flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-primary font-mono text-xs font-semibold text-primary-foreground">
              2
            </span>
            <span className="text-sm font-semibold">Betaling</span>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-6 px-6 py-6">
          {/* Error banner */}
          <div className="flex items-start gap-3.5 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-destructive text-destructive-foreground">
              <AlertTriangle size={20} strokeWidth={1.5} />
            </span>
            <div className="text-destructive">
              <div className="text-[13.5px] font-semibold">
                Kortet ble avvist av banken
              </div>
              <div className="mt-1 text-[12.5px] leading-snug">
                Sjekk at nummer, utløp og CVC stemmer — eller prøv et annet
                kort. Du har ikke blitt belastet.
              </div>
              <span className="mt-2 inline-block rounded bg-destructive/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em]">
                Feilkode: CARD_DECLINED · 51
              </span>
            </div>
          </div>

          {/* Form + sammendrag */}
          <div className="grid grid-cols-[1fr_240px] gap-6">
            <div className="space-y-4">
              <div>
                <label className="flex items-center justify-between font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                  <span>Kortnummer</span>
                  <span className="rounded bg-secondary px-1.5 py-0.5 font-sans text-[10px] font-bold tracking-wider text-foreground">
                    VISA
                  </span>
                </label>
                <input
                  type="text"
                  defaultValue="4000 0000 0000 0002"
                  className="mt-2 w-full rounded-md border-2 border-destructive bg-card px-3.5 py-2.5 font-mono text-sm tabular-nums focus:outline-none"
                />
                <div className="mt-1.5 inline-flex items-center gap-1.5 font-mono text-[11.5px] text-destructive">
                  <Info size={11} strokeWidth={1.5} />
                  Kortet støttes ikke for online-kjøp
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    Utløp
                  </label>
                  <input
                    type="text"
                    defaultValue="12 / 28"
                    className="mt-2 w-full rounded-md border border-input bg-card px-3.5 py-2.5 font-mono text-sm tabular-nums focus:border-ring focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                    CVC
                  </label>
                  <input
                    type="text"
                    defaultValue="123"
                    className="mt-2 w-full rounded-md border border-input bg-card px-3.5 py-2.5 font-mono text-sm tabular-nums focus:border-ring focus:outline-none"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-center gap-2.5">
                <span className="relative inline-block h-5 w-9 rounded-full bg-primary">
                  <span className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-primary-foreground" />
                </span>
                <span className="text-xs font-medium">
                  Lagre kort for fremtidige kjøp
                </span>
              </label>
            </div>

            {/* Sammendrag */}
            <aside className="rounded-xl border border-border bg-secondary/40 p-4">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Sammendrag
              </div>
              <div className="mt-3 space-y-1.5 font-mono text-xs tabular-nums">
                <div className="flex justify-between">
                  <strong className="font-semibold">Pro · år</strong>
                  <span>3 000,00</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>MVA (inkl.)</span>
                  <span>600,00</span>
                </div>
              </div>
              <div className="my-3 h-px bg-border" />
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                  Total i dag
                </span>
                <span className="font-mono text-xl font-semibold tabular-nums">
                  3 000 kr
                </span>
              </div>
              <div className="mt-3 text-[11px] font-medium text-destructive">
                Ingen belastning er gjennomført.
              </div>
            </aside>
          </div>

          {/* Trust */}
          <div className="flex items-center justify-center gap-2 font-mono text-[11px] font-medium text-muted-foreground">
            <Lock size={13} strokeWidth={1.5} />
            Trenger du hjelp? Kontakt støtte@akgolf.no
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-6 py-4">
          <div className="flex items-center gap-2">
            <button className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
              Avbryt
            </button>
            <button className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
              <LifeBuoy size={14} strokeWidth={1.5} />
              Kontakt support
            </button>
          </div>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            Prøv igjen
            <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </footer>
      </div>
    </div>
  );
}
