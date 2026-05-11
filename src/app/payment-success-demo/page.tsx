/**
 * DEMO — Payment success-state
 * Bygd fra wireframe live-states/e6-payment-success.html
 * URL: /payment-success-demo
 */

import { CheckCircle2, Download, ArrowRight, X, Star } from "lucide-react";

export default function PaymentSuccessDemo() {
  return (
    <div className="min-h-screen bg-foreground/80 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[560px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Hero med soft accent-glow */}
        <div className="relative overflow-hidden bg-gradient-to-b from-accent/30 via-card to-card">
          {/* Header */}
          <header className="relative flex items-start justify-between gap-6 px-6 pt-6">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Aktivering fullført
              </div>
              <h1 className="mt-1.5 font-display text-[32px] font-semibold leading-tight tracking-tight">
                Velkommen til <em className="italic">Pro</em>
              </h1>
            </div>
            <button
              className="grid h-9 w-9 place-items-center rounded-md border border-border bg-card/80 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Lukk"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </header>

          {/* Stage */}
          <div className="relative flex flex-col items-center gap-4 px-6 pt-10 pb-10 text-center">
            {/* Stor checkmark */}
            <div className="grid h-24 w-24 place-items-center rounded-full bg-accent text-accent-foreground shadow-[0_0_0_8px_rgba(209,248,67,0.30),0_12px_30px_rgba(46,87,16,0.20)]">
              <CheckCircle2 size={48} strokeWidth={1.5} />
            </div>

            <div className="mt-2">
              <div className="font-display text-[26px] italic leading-tight">
                Markus, du er Pro.
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Alt låst opp. Kvittering sendt til markus.r.pedersen@gmail.com.
              </div>
            </div>

            {/* Tier-pill */}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
              <Star size={11} strokeWidth={1.5} className="fill-accent" />
              PlayerHQ Pro · år
            </span>

            {/* Kvittering */}
            <div className="mt-2 w-full max-w-[380px] rounded-xl border border-border bg-card p-5 text-left">
              <div className="flex items-center justify-between border-b border-dashed border-border pb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                <span>Kvittering · ord-id #PHQ-26-039182</span>
                <span>11. mai 2026</span>
              </div>
              <div className="mt-2 space-y-1.5 font-mono text-xs tabular-nums">
                <div className="flex justify-between py-1">
                  <span>Pro · år</span>
                  <strong className="font-semibold">3 000,00 kr</strong>
                </div>
                <div className="flex justify-between py-1 text-muted-foreground">
                  <span>MVA inkl.</span>
                  <span>600,00 kr</span>
                </div>
                <div className="mt-1 flex justify-between border-t border-dashed border-border pt-2">
                  <strong className="font-semibold">Neste belastning</strong>
                  <strong className="font-semibold">11. mai 2027</strong>
                </div>
              </div>
            </div>

            {/* Redirect-timer */}
            <div className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Du sendes til dashbord om 05 sek
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-6 py-4">
          <button className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
            <Download size={14} strokeWidth={1.5} />
            Last ned kvittering
          </button>
          <button className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            Åpne Pro-dashbord
            <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </footer>
      </div>
    </div>
  );
}
