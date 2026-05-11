/**
 * DEMO — Payment · Dark
 * Bygd fra wireframe live-states/e6-payment-moerkt.html
 * URL: /payment-dark-demo
 */

import { Check, Lock, X } from "lucide-react";

const FEATURES = [
  "Ubegrenset bookinger",
  "Full leaderboard-tilgang",
  "AI-genererte økter",
  "TrackMan-historikk og trender",
  "Coach-anbefalinger fra Anders",
  "Avansert statistikk og SG-tap",
] as const;

export default function PaymentDarkDemo() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen items-center justify-center bg-black/70 px-4 py-8">
        <div className="w-full max-w-[640px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <header className="flex items-start justify-between gap-6 border-b border-border px-6 pb-5 pt-6">
            <div>
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Oppgradering · PlayerHQ Pro
              </div>
              <h1 className="mt-1.5 font-display text-[32px] font-semibold leading-tight tracking-tight text-foreground">
                Oppgrader til <em className="italic text-accent">Pro</em>
              </h1>
            </div>
            <button
              type="button"
              aria-label="Lukk"
              className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </header>

          {/* Steps */}
          <div className="flex items-center gap-3 border-b border-border bg-secondary/40 px-6 py-4">
            <div className="inline-flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-accent font-mono text-xs font-semibold text-accent-foreground">
                1
              </span>
              <span className="text-sm font-semibold text-foreground">Velg plan</span>
            </div>
            <span className="h-px flex-1 bg-border" />
            <div className="inline-flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-secondary/60 font-mono text-xs font-semibold text-muted-foreground">
                2
              </span>
              <span className="text-sm font-medium text-muted-foreground">Betaling</span>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-6 px-6 py-6">
            {/* Plans */}
            <div className="grid grid-cols-2 gap-3">
              {/* Måned */}
              <div className="relative rounded-xl border border-border bg-secondary/30 p-5">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-border" />
                  <div className="text-sm font-semibold text-foreground">Måned</div>
                </div>
                <div className="mt-4 font-mono text-[32px] font-medium leading-none tabular-nums text-foreground">
                  300
                  <span className="ml-1 text-xs font-medium text-muted-foreground">
                    kr / mnd
                  </span>
                </div>
                <div className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Faktureres månedlig
                  <br />
                  Kanseller når som helst
                </div>
              </div>

              {/* År — selected */}
              <div
                className="relative rounded-xl border-2 border-accent bg-accent/5 p-5"
                style={{ boxShadow: "0 0 0 3px rgba(209,248,67,0.15)" }}
              >
                <span className="absolute -top-2.5 right-4 rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-accent-foreground">
                  Anbefalt
                </span>
                <div className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 place-items-center rounded-full border-2 border-accent bg-accent">
                    <span className="block h-2 w-2 rounded-full bg-accent-foreground" />
                  </span>
                  <div className="text-sm font-semibold text-foreground">År</div>
                </div>
                <div className="mt-4 font-mono text-[32px] font-medium leading-none tabular-nums text-foreground">
                  3 000
                  <span className="ml-1 text-xs font-medium text-muted-foreground">
                    kr / år
                  </span>
                </div>
                <div className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  250 kr / mnd · trekkes én gang
                </div>
                <span className="mt-3 inline-flex items-center rounded-full bg-accent/15 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-accent">
                  Spar 600 kr · 16 % rabatt
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="rounded-xl border border-border bg-secondary/30 p-5">
              <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                Du får med Pro
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2.5">
                {FEATURES.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check
                      size={16}
                      strokeWidth={2}
                      className="mt-0.5 shrink-0 text-accent"
                    />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust */}
            <div className="flex items-center justify-center gap-2 font-mono text-[11px] font-medium text-muted-foreground">
              <Lock size={13} strokeWidth={1.75} className="text-accent" />
              Sikker betaling via Stripe · norsk MVA inkludert
            </div>
          </div>

          {/* Footer */}
          <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-6 py-4">
            <button
              type="button"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
            >
              Avbryt
            </button>
            <button
              type="button"
              className="rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Velg plan →
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
}
