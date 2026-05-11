/**
 * DEMO — Payment · loading
 * Bygd fra wireframe live-states/e6-payment-loading.html
 * URL: /payment-loading-demo
 */

import { Check, Circle, Clock, Loader2, Lock, X } from "lucide-react";

export default function PaymentLoadingDemo() {
  return (
    <div className="min-h-screen bg-foreground/80 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[640px] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="flex items-start justify-between gap-6 border-b border-border px-6 pt-6 pb-5">
          <div>
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Behandler · vent et øyeblikk
            </div>
            <h1 className="mt-1.5 font-display text-[28px] font-semibold leading-tight tracking-tight">
              Bekrefter <em className="italic">betaling</em>
            </h1>
          </div>
          <button
            className="grid h-9 w-9 cursor-not-allowed place-items-center rounded-md border border-border text-muted-foreground opacity-30"
            aria-label="Lukk"
            disabled
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </header>

        {/* Body */}
        <div className="flex flex-col items-center gap-6 px-7 py-16">
          {/* Spinner */}
          <Loader2 size={56} strokeWidth={1.5} className="animate-spin text-primary" />

          <div className="text-center">
            <div className="font-display text-[22px] italic leading-tight text-foreground">
              Vi snakker med banken din.
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Ikke lukk vinduet. Dette tar normalt 3-8 sekunder.
            </p>
          </div>

          {/* Steps */}
          <div className="mt-2 flex w-full max-w-sm flex-col gap-3.5 rounded-xl border border-border bg-secondary/40 px-6 py-5">
            <div className="flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-primary">
              <Check size={16} strokeWidth={2.5} />
              Kortinfo validert
            </div>
            <div className="flex animate-pulse items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-primary">
              <Clock size={16} strokeWidth={2} />
              Verifiserer 3D Secure ...
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              <Circle size={16} strokeWidth={2} />
              Aktiverer Pro på kontoen
            </div>
          </div>

          {/* Trust */}
          <div className="flex items-center gap-2 font-mono text-[11px] font-medium text-muted-foreground">
            <Lock size={13} strokeWidth={1.5} />
            256-bit kryptert via Stripe · ikke last sida på nytt
          </div>
        </div>

        {/* Footer */}
        <footer className="flex items-center justify-end gap-3 border-t border-border bg-secondary/40 px-6 py-4">
          <button
            className="inline-flex cursor-not-allowed items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground opacity-60"
            disabled
          >
            <Loader2 size={14} strokeWidth={2} className="animate-spin" />
            Behandler ...
          </button>
        </footer>
      </div>
    </div>
  );
}
