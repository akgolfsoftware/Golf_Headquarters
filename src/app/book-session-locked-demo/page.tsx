/**
 * PILOT — BookSessionModal · tier-låst (FREE-grense nådd)
 * Bygd direkte fra wireframe/modal-C/01-book-session-steg1-locked.html
 * URL: /book-session-locked-demo
 *
 * Mock-data: Markus har brukt 2 av 2 bookinger i mai 2026. Helskjerm med upgrade-CTA.
 */

import { X, Lock, ArrowRight, Check, Zap, Scissors } from "lucide-react";

const BACKDROP = "fixed inset-0 z-0 bg-[rgba(10,31,24,0.5)]" as const;

interface Benefit {
  icon: "check" | "bolt" | "scissors";
  title: string;
  sub: string;
}

const BENEFITS: Benefit[] = [
  {
    icon: "check",
    title: "Ubegrenset booking",
    sub: "Book så ofte du vil — inkludert helger",
  },
  {
    icon: "bolt",
    title: "Prioritert tilgang",
    sub: "Du får slotene først — også 24 t før alle andre",
  },
  {
    icon: "scissors",
    title: "20 % på 1:1 coaching",
    sub: "1 280 kr/time hos Anders mot 1 600 kr",
  },
];

export default function BookSessionLockedDemo() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className={BACKDROP} aria-hidden="true" />

      <div className="relative z-10 mx-auto my-8 w-full max-w-[560px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Head */}
        <header className="flex items-start justify-between gap-4 px-8 pb-3 pt-7">
          <div>
            <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.07em]">
              <span className="text-[#B8852A]">●</span>
              <span className="text-[#B8852A]">FREE-konto · grense nådd</span>
            </div>
            <h2 className="mt-1.5 font-display text-[26px] font-semibold leading-tight tracking-tight text-foreground">
              Book økt
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

        {/* Body */}
        <div className="flex flex-col items-center px-8 pb-2 pt-4 text-center">
          {/* Lock-icon */}
          <div className="relative mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-primary to-[#003F2D] text-accent">
            <Lock className="h-10 w-10" strokeWidth={1.75} />
            <span
              className="absolute inset-[-6px] rounded-[30px] border-2 border-accent/30"
              aria-hidden="true"
            />
          </div>

          <div className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-[#B8852A]">
            2 av 2 bookinger brukt denne måneden
          </div>
          <h3 className="mb-2 max-w-[420px] font-display text-[32px] italic leading-[1.1] text-foreground">
            Mer trening, samme måned.
          </h3>
          <p className="mb-6 max-w-[380px] text-[14px] leading-[1.5] text-muted-foreground">
            Pro fjerner taket, gir prioritert kø på Mulligan-studio og 20 % rabatt på
            1:1 coaching.
          </p>

          {/* Benefits */}
          <div className="mb-6 flex w-full max-w-[380px] flex-col gap-2.5 text-left">
            {BENEFITS.map((b) => (
              <BenefitRow key={b.title} benefit={b} />
            ))}
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2.5 rounded-xl bg-accent px-6 py-3.5 text-[15px] font-bold text-accent-foreground transition-opacity hover:opacity-90"
          >
            Oppgrader til Pro
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </button>
          <div className="mt-2.5 font-mono text-[11px] text-muted-foreground">
            300 kr/mnd · sies opp når som helst
          </div>
          <div className="mt-5 text-[12px] text-muted-foreground/70">
            Eller vent til 1. juni — gratis-grensen tilbakestilles om 21 dager.
          </div>
        </div>

        {/* Foot */}
        <footer className="mt-6 flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-8 py-4">
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Lukk
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Se hva som er booket
          </button>
        </footer>
      </div>
    </div>
  );
}

function BenefitRow({ benefit }: { benefit: Benefit }) {
  const Icon =
    benefit.icon === "check"
      ? Check
      : benefit.icon === "bolt"
        ? Zap
        : Scissors;
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-background px-3.5 py-3">
      <div className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" strokeWidth={2} />
      </div>
      <div className="text-[13px] leading-[1.4]">
        <b className="block font-semibold text-foreground">{benefit.title}</b>
        <span className="text-[12.5px] text-muted-foreground">{benefit.sub}</span>
      </div>
    </div>
  );
}
