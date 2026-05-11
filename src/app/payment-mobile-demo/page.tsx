/**
 * DEMO — Payment / Oppgrader til Pro (mobile)
 * Bygd fra wireframe/_extracted/live-states/e6-payment-mobile.html
 * URL: /payment-mobile-demo
 */

import { ArrowRight, Check, Lock } from "lucide-react";

type Plan = {
  key: "manned" | "aar";
  name: string;
  price: string;
  unit: string;
  meta: string;
  selected: boolean;
  badge?: string;
  save?: string;
};

const PLANS: Plan[] = [
  {
    key: "manned",
    name: "Måned",
    price: "300",
    unit: "kr / mnd",
    meta: "Faktureres månedlig · kanseller når som helst",
    selected: false,
  },
  {
    key: "aar",
    name: "År",
    price: "3 000",
    unit: "kr / år",
    meta: "250 kr / mnd · trekkes én gang",
    selected: true,
    badge: "Anbefalt",
    save: "Spar 600 kr · 16 %",
  },
];

const FEATURES: string[] = [
  "Ubegrenset bookinger",
  "Full leaderboard-tilgang",
  "AI-genererte økter",
  "TrackMan-historikk og trender",
  "Coach-anbefalinger",
  "Avansert SG-statistikk",
];

export default function PaymentMobileDemo() {
  return (
    <div className="min-h-screen w-full bg-foreground/85 flex justify-center">
      <div className="relative w-full max-w-[420px] min-h-screen bg-card flex flex-col">
        {/* Header */}
        <header className="px-4 pt-5 pb-3">
          <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            PlayerHQ Pro
          </div>
          <h1 className="mt-1 font-display text-[26px] font-semibold leading-tight tracking-tight text-foreground">
            Oppgrader til <em className="italic">Pro</em>
          </h1>
        </header>

        {/* Steps */}
        <div className="flex items-center gap-3 border-b border-border px-4 pb-3">
          <div className="inline-flex items-center gap-2 font-sans text-[12px] font-medium text-foreground">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-primary font-mono text-[11px] font-semibold text-primary-foreground">
              1
            </span>
            Velg plan
          </div>
          <span className="h-px flex-1 bg-border" />
          <div className="inline-flex items-center gap-2 font-sans text-[12px] font-medium text-muted-foreground">
            <span className="grid h-6 w-6 place-items-center rounded-full border border-border bg-card font-mono text-[11px] font-semibold text-muted-foreground">
              2
            </span>
            Betaling
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 px-4 py-4 space-y-3">
          {/* Plans stacked */}
          <div className="space-y-3">
            {PLANS.map((p) => (
              <button
                key={p.key}
                className={
                  p.selected
                    ? "relative w-full rounded-xl border-2 border-primary bg-primary/[0.04] p-4 text-left"
                    : "relative w-full rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-secondary"
                }
              >
                {p.badge ? (
                  <span className="absolute -top-2 right-4 rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-primary-foreground">
                    {p.badge}
                  </span>
                ) : null}
                <div className="flex items-center gap-2">
                  <span
                    className={
                      p.selected
                        ? "relative grid h-5 w-5 place-items-center rounded-full border-2 border-primary"
                        : "grid h-5 w-5 place-items-center rounded-full border-2 border-border"
                    }
                  >
                    {p.selected ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    ) : null}
                  </span>
                  <span className="font-sans text-[14px] font-semibold text-foreground">
                    {p.name}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-1.5 font-mono tabular-nums">
                  <span className="text-[24px] font-semibold text-foreground tracking-tight">
                    {p.price}
                  </span>
                  <span className="text-[12px] text-muted-foreground">
                    {p.unit}
                  </span>
                </div>
                <div className="mt-1 font-mono text-[11px] tracking-[0.04em] text-muted-foreground">
                  {p.meta}
                </div>
                {p.save ? (
                  <div className="mt-2 inline-flex items-center rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-accent-foreground">
                    {p.save}
                  </div>
                ) : null}
              </button>
            ))}
          </div>

          {/* Features */}
          <div className="rounded-xl border border-border bg-secondary/40 p-4">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Du får med Pro
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {FEATURES.map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-2 font-sans text-[12.5px] text-foreground"
                >
                  <Check
                    size={14}
                    strokeWidth={2}
                    className="shrink-0 text-primary"
                  />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Trust */}
        <div className="flex items-center gap-1.5 px-4 pb-2 font-mono text-[9px] uppercase tracking-[0.10em] text-muted-foreground">
          <Lock size={11} strokeWidth={1.75} />
          Sikker via Stripe · norsk MVA inkl.
        </div>

        {/* Footer */}
        <footer className="flex flex-col gap-2 border-t border-border px-4 py-3">
          <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 font-sans text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            Velg plan
            <ArrowRight size={16} strokeWidth={2} />
          </button>
          <button className="inline-flex h-11 w-full items-center justify-center rounded-md font-sans text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
            Avbryt
          </button>
        </footer>
      </div>
    </div>
  );
}
