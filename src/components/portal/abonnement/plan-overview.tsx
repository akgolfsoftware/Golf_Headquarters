/**
 * PlanOverview — mobil-first plan-hero (port av .plan-head + .stats fra
 * components-subscription.html, tilpasset 430px og 2-tier-modellen).
 *
 * Forest-gradient header med status-pip, plan-navn, meta-strip (aktiv siden ·
 * neste trekk) og en stats-rad: mnd-avgift · credit-saldo · forfall.
 * Credit-saldo bruker CreditMeter når pakken har credits.
 *
 * Server component. Stripe-handlingsknappene sendes inn som `action` — vi
 * eier ikke checkout/portal-logikken her.
 */

import type { ReactNode } from "react";
import { CreditMeter } from "./credit-meter";

const NOK = new Intl.NumberFormat("nb-NO");

function formatDato(d: Date | null | undefined) {
  if (!d) return null;
  return d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function Stat({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 px-3.5 py-3 first:pl-4">
      <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-xl font-extrabold leading-none tracking-[-0.02em] tabular-nums text-foreground">
        {children}
      </span>
    </div>
  );
}

export function PlanOverview({
  erPro,
  status,
  aktivSiden,
  nesteTrekk,
  monthlyCredits,
  creditsRemaining,
  forfallOmDager,
  playerName,
  action,
}: {
  erPro: boolean;
  status: string | null;
  aktivSiden: Date | null;
  nesteTrekk: Date | null;
  monthlyCredits: number;
  creditsRemaining: number;
  forfallOmDager: number | null;
  playerName: string;
  action: ReactNode;
}) {
  const harCredits = erPro && monthlyCredits > 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Header — forest-glød */}
      <div className="relative border-b border-border bg-gradient-to-b from-transparent to-primary/[0.025] px-5 py-5 sm:px-6">
        <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
          Nåværende plan
        </span>
        <h2 className="font-display text-2xl font-bold leading-tight tracking-[-0.025em] text-foreground">
          Du er på{" "}
          <em
            className="not-italic"
            style={{
              fontFamily: "'Inter Tight', sans-serif",
              fontStyle: "italic",
              color: "hsl(var(--primary))",
            }}
          >
            {erPro ? "Pro" : "Gratis"}
          </em>
          .
        </h2>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
          <span className="truncate">{playerName}</span>
          {erPro && aktivSiden && (
            <>
              <span className="text-border" aria-hidden>
                ·
              </span>
              <span>
                Siden <b className="font-extrabold text-foreground">{formatDato(aktivSiden)}</b>
              </span>
            </>
          )}
          {erPro && nesteTrekk && (
            <>
              <span className="text-border" aria-hidden>
                ·
              </span>
              <span>
                Neste trekk{" "}
                <b className="font-extrabold text-foreground">{formatDato(nesteTrekk)}</b>
              </span>
            </>
          )}
          {erPro && status && status !== "ACTIVE" && (
            <>
              <span className="text-border" aria-hidden>
                ·
              </span>
              <span className="text-warning">{status}</span>
            </>
          )}
        </div>
      </div>

      {/* Stats — mnd-avgift · credits · forfall */}
      <div className="grid grid-cols-2 divide-x divide-y divide-border sm:grid-cols-3 sm:divide-y-0">
        <Stat label="Mnd-avgift">
          {erPro ? (
            <>
              300
              <span className="ml-0.5 text-xs font-bold text-muted-foreground">kr</span>
            </>
          ) : (
            <>
              0<span className="ml-0.5 text-xs font-bold text-muted-foreground">kr</span>
            </>
          )}
        </Stat>

        <Stat label="Credits igjen">
          {harCredits ? (
            <span className="flex flex-col gap-2">
              <span>
                {creditsRemaining}
                <span className="ml-0.5 text-xs font-bold text-muted-foreground">
                  / {monthlyCredits}
                </span>
              </span>
              <CreditMeter
                remaining={creditsRemaining}
                total={monthlyCredits}
                size="sm"
                showLabel={false}
              />
            </span>
          ) : (
            <span className="text-base font-bold text-muted-foreground">—</span>
          )}
        </Stat>

        <Stat label="Forfall om">
          {erPro && forfallOmDager !== null ? (
            <>
              {forfallOmDager}
              <span className="ml-0.5 text-xs font-bold text-muted-foreground">
                {forfallOmDager === 1 ? "dag" : "dager"}
              </span>
            </>
          ) : (
            <span className="text-base font-bold text-muted-foreground">—</span>
          )}
        </Stat>
      </div>

      {/* Handling — Stripe-knapp (oppgrader / administrer) */}
      <div className="border-t border-border bg-secondary/40 px-5 py-4 sm:px-6">
        {action}
        {!erPro && (
          <p className="mt-3 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
            Pro gir AI-coach, egendefinerte økter og direkte kontakt med coach.
          </p>
        )}
      </div>
    </section>
  );
}

export { NOK };
