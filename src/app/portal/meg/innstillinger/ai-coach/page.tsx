/**
 * AI Coach — /portal/meg/innstillinger/ai-coach
 *
 * Portet fra designfasit: "PlayerHQ Meg Innstillinger Rest (hybrid).dc.html"
 * (AI-skjerm, linje 91–127).
 *
 * Element-liste (fasit, topp → bunn):
 *   1. Tilbake-lenke → /innstillinger
 *   2. Beta-badge "Kommer snart · V2" (blå)
 *   3. h1 "AI-coach" med italic forest
 *   4. Ingress — hva AI-coachen gjør
 *   5. InsightCard — feature-liste med grønne check-ikoner
 *   6. FAQ-seksjon (3 spørsmål, statisk)
 *   7. CTA — "Aktiver AI-coach (V2)" (lime knapp, ikke-klikkbar — V2)
 *   8. Tekstlenke — "Les mer om AI-coach"
 *
 * Server component — ingen real funksjonalitet ennå (V2-feature).
 */

import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export const dynamic = "force-dynamic";

const FAQ = [
  "Hva kan AI-coachen ikke gjøre?",
  "Er AI-data privat?",
  "Erstatter AI-coachen Anders?",
] as const;

const FEATURES = [
  "Analyserer SG-data og foreslår drills automatisk",
  "Ukentlig AI-rapport til deg og coach",
  "Svarer på golfspørsmål basert på dine data",
] as const;

export default async function AiCoachPage() {
  await requirePortalUser();

  return (
    <div className="mx-auto w-full max-w-[480px] px-4 pb-20 sm:px-6">
      {/* Tilbake */}
      <Link
        href="/portal/meg/innstillinger"
        className="inline-flex min-h-11 items-center gap-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
        Innstillinger
      </Link>

      {/* Beta-badge */}
      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-info/20 bg-info/10 px-3 py-1.5">
        <span
          className="h-1.5 w-1.5 rounded-full bg-info"
          aria-hidden
        />
        <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.10em] text-info">
          Kommer snart · V2
        </span>
      </div>

      {/* Header */}
      <h1 className="mt-4 font-display text-[28px] font-bold leading-[1.05] tracking-[-0.03em] text-foreground sm:text-[34px]">
        AI
        <em
          style={{ color: "var(--color-primary)" }}
          className="font-medium"
        >
          -coach
        </em>
      </h1>
      <p className="mt-2 max-w-[30ch] text-[13.5px] leading-[1.6] text-muted-foreground">
        Din personlige AI-assistent — analyserer data, foreslår øvelser og gir ukentlig rapport.
      </p>

      {/* InsightCard */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm" style={{ borderLeftWidth: "3px", borderLeftColor: "var(--color-accent)" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-accent">
            <Sparkles className="h-[18px] w-[18px] text-accent-foreground" strokeWidth={1.5} aria-hidden />
          </div>
          <div>
            <div className="font-display text-[14px] font-bold leading-tight tracking-[-0.01em] text-foreground">
              Hva AI-coach gjør
            </div>
            <div className="mt-0.5 font-mono text-[9.5px] text-muted-foreground">
              Personlig · datadrevet · coach-assistent
            </div>
          </div>
        </div>
        <ul className="mt-4 flex flex-col gap-2">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-[13px] text-foreground">
              <Check className="mt-0.5 h-[13px] w-[13px] shrink-0 text-success" strokeWidth={2.5} aria-hidden />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* FAQ */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-secondary px-4 py-2.5">
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
            Ofte stilte spørsmål
          </span>
        </div>
        {FAQ.map((q, i) => (
          <div
            key={q}
            className={`flex items-center justify-between px-4 py-3.5 ${i < FAQ.length - 1 ? "border-b border-border" : ""}`}
          >
            <span className="text-[13.5px] font-medium text-foreground">{q}</span>
            <ChevronRight
              className="h-[14px] w-[14px] shrink-0 text-muted-foreground"
              strokeWidth={2}
              aria-hidden
            />
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-6 flex flex-col gap-3">
        {/* Knappen er ikke-klikkbar (V2) — vises som disabled */}
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="flex h-[50px] w-full cursor-not-allowed items-center justify-center rounded-full bg-accent font-mono text-[13px] font-bold uppercase tracking-[0.08em] text-accent-foreground opacity-50"
        >
          Aktiver AI-coach (V2)
        </button>
        <Link
          href="/portal/meg/help"
          className="block text-center font-mono text-[11px] font-semibold text-primary"
        >
          Les mer om AI-coach →
        </Link>
      </div>
    </div>
  );
}
