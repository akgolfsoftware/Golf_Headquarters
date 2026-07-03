/**
 * Abonnement — PlayerHQ abonnement- og faktura-skjerm (port av fasit
 * [historisk fasit, fjernet 2026-07-03] _screens/pl-abonnement.png · 2-tier-modell GRATIS + PRO).
 *
 * Mobil-først presentasjon. Bygd EKSAKT fra fasiten:
 *   1. Side-header  — eyebrow + display-H1 (faktura i grønn italic) + ingress
 *   2. Nåværende plan — forest-gradient panel: pip "NÅVÆRENDE PLAN", "Du er på <Gratis>",
 *      spiller-meta, stats-grid (mnd-avgift · credits · forfall), footer med
 *      oppgrader-CTA + micro-tekst
 *   3. "Sammenlign planer" — seksjons-header (tittel · status-tekst · ENDRE PLAN-lenke)
 *      + sammenlignings-panel med Pro-kortet (ANBEFALT, 300 kr/mnd, 6 features)
 *   4. Faktura-historikk — panel med tom-tilstand (kvittering-ikon + tekst)
 *
 * Presentasjonell og props-drevet. INGEN Prisma/DB/auth/Stripe-logikk her —
 * handlingsknappene er next/link mot /portal-ruter fra manifestet.
 */

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Receipt,
  type LucideIcon,
} from "lucide-react";

// ── Datakontrakt (matcher fasiten: GRATIS-tier, tom-tilstand) ──
export type Tier = "GRATIS" | "PRO";

export interface AbonnementData {
  /** Spillerens navn (vises i meta-strip, uppercase) */
  spillerNavn: string;
  /** Aktiv plan */
  tier: Tier;
  /** Pris pr. måned i kroner for nåværende plan */
  mndAvgift: number;
  /** Credits igjen i inneværende periode — null = ikke relevant (GRATIS) */
  creditsIgjen: number | null;
  /** Dager til neste trekk — null = ikke relevant (GRATIS) */
  forfallOmDager: number | null;
  /** Pris pr. måned for Pro (oppgraderings-mål) */
  proPris: number;
  /** Pro-funksjoner (vises i sammenlignings-kortet) */
  proFeatures: string[];
  /** Betalingshistorikk — tom array = tom-tilstand */
  fakturaer: FakturaRad[];
  /** Lenker for knappene */
  hrefs: {
    /** Oppgrader-flyt (Stripe checkout) */
    oppgrader: string;
    /** Endre/administrer plan */
    endrePlan: string;
  };
}

export interface FakturaRad {
  id: string;
  periode: string;
  belop: string;
  status: string;
}

// ── Sub-komponenter ──────────────────────────────────────────

/** Seksjons-header: tittel · valgfri status-tekst · valgfri lenke (med pil). */
function SectionHeader({
  title,
  status,
  link,
}: {
  title: string;
  status?: string;
  link?: { label: string; href: string };
}) {
  return (
    <div className="mb-3.5 flex items-center gap-4">
      <h2 className="shrink-0 font-display text-base font-bold leading-tight tracking-[-0.01em] text-foreground">
        {title}
      </h2>
      {status && (
        <span className="min-w-0 flex-1 font-mono text-[10px] font-bold uppercase leading-tight tracking-[0.10em] text-muted-foreground">
          {status}
        </span>
      )}
      {link && (
        <Link
          href={link.href}
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-primary transition-opacity hover:opacity-70"
        >
          {link.label}
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
        </Link>
      )}
    </div>
  );
}

/** Én celle i nåværende-plan-stats-grid. */
function Stat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 px-5 py-4">
      <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-xl font-extrabold leading-none tracking-[-0.02em] tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}

/** Grønn italic-aksent (Inter Tight italic) — gjenbrukt i H1 og H2. */
function Accent({ children }: { children: React.ReactNode }) {
  return (
    <em
      className="not-italic"
      style={{
        fontFamily: "'Inter Tight', sans-serif",
        fontStyle: "italic",
        color: "hsl(var(--primary))",
      }}
    >
      {children}
    </em>
  );
}

/** Nåværende-plan-panel: forest-gradient header + stats + oppgrader-footer. */
function CurrentPlanCard({ data }: { data: AbonnementData }) {
  const erPro = data.tier === "PRO";
  const tierLabel = erPro ? "Pro" : "Gratis";

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Header — forest-glød */}
      <div className="border-b border-border bg-gradient-to-b from-transparent to-primary/[0.025] px-5 py-5">
        <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-accent">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
          Nåværende plan
        </span>
        <h2 className="font-display text-[26px] font-bold leading-[1.1] tracking-[-0.025em] text-foreground">
          Du er på <Accent>{tierLabel}</Accent>.
        </h2>
        <p className="mt-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.04em] text-muted-foreground">
          {data.spillerNavn}
        </p>
      </div>

      {/* Stats — mnd-avgift · credits · forfall */}
      <div className="grid grid-cols-2 divide-x divide-y divide-border">
        <Stat
          label="Mnd-avgift"
          value={
            <>
              {data.mndAvgift}
              <span className="ml-0.5 text-xs font-bold text-muted-foreground">
                kr
              </span>
            </>
          }
        />
        <Stat
          label="Credits igjen"
          value={
            data.creditsIgjen !== null ? (
              data.creditsIgjen
            ) : (
              <span className="text-muted-foreground">—</span>
            )
          }
        />
        <Stat
          label="Forfall om"
          value={
            data.forfallOmDager !== null ? (
              <>
                {data.forfallOmDager}
                <span className="ml-0.5 text-xs font-bold text-muted-foreground">
                  {data.forfallOmDager === 1 ? "d" : "d"}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">—</span>
            )
          }
        />
      </div>

      {/* Footer — oppgrader-CTA + micro */}
      {!erPro && (
        <div className="border-t border-border bg-secondary/40 px-5 py-5">
          <Link
            href={data.hrefs.oppgrader}
            className="inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 font-sans text-sm font-bold text-accent transition-opacity hover:opacity-90"
          >
            Oppgrader til Pro · {data.proPris} kr/mnd
          </Link>
          <p className="mt-3.5 font-mono text-[10px] font-bold uppercase leading-relaxed tracking-[0.06em] text-muted-foreground">
            Pro gir AI-coach, egendefinerte økter og direkte kontakt med coach.
          </p>
        </div>
      )}
    </section>
  );
}

/** Pro-kortet i sammenlignings-panelet. */
function ComparePlanCard({
  pris,
  features,
}: {
  pris: number;
  features: string[];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="px-5 py-5">
        <div className="mb-1 flex items-center gap-3">
          <h3 className="font-display text-lg font-bold tracking-[-0.02em] text-foreground">
            Pro
          </h3>
          <span className="ml-auto rounded bg-accent px-2.5 py-1 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-accent-foreground">
            Anbefalt
          </span>
        </div>
        <p className="font-mono text-sm font-bold tracking-[0.02em] tabular-nums text-muted-foreground">
          {pris} kr/mnd
        </p>

        <ul className="mt-4 flex flex-col gap-2.5">
          {features.map((f) => (
            <li
              key={f}
              className="grid grid-cols-[16px_1fr] items-start gap-2.5 text-[15px] leading-snug tracking-[-0.005em] text-foreground"
            >
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                strokeWidth={2.25}
                aria-hidden
              />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Tom-tilstand for faktura-historikk: kvittering-ikon i grå sirkel. */
function EmptyHistory({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <Icon
          className="h-6 w-6 text-muted-foreground"
          strokeWidth={1.5}
          aria-hidden
        />
      </div>
      <div className="space-y-1.5">
        <p className="font-display text-base font-bold tracking-[-0.01em] text-foreground">
          {title}
        </p>
        <p className="mx-auto max-w-[34ch] text-sm leading-relaxed text-muted-foreground">
          {body}
        </p>
      </div>
    </div>
  );
}

/** Faktura-historikk-panel (tom-tilstand i fasiten). */
function InvoiceHistory({ fakturaer }: { fakturaer: FakturaRad[] }) {
  const tom = fakturaer.length === 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-4 border-b border-border px-5 py-4">
        <h2 className="font-display text-base font-bold tracking-[-0.01em] text-foreground">
          Faktura-historikk
        </h2>
        <span className="ml-auto font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">
          {tom ? "Ingen betalinger" : `${fakturaer.length} betalinger`}
        </span>
      </div>

      {tom ? (
        <EmptyHistory
          icon={Receipt}
          title="Ingen betalinger registrert"
          body="Når du har gjort en betaling — abonnement, booking eller faktura — vises kvitteringer her."
        />
      ) : (
        <ul className="divide-y divide-border">
          {fakturaer.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-4 px-5 py-4 text-sm"
            >
              <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                {f.periode}
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-[0.06em] text-muted-foreground">
                {f.status}
              </span>
              <span className="font-mono text-sm font-bold tabular-nums text-foreground">
                {f.belop}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

// ── Hoved-komponent ──────────────────────────────────────────

export function Abonnement({ data }: { data: AbonnementData }) {
  const statusTekst = `${data.tier} er din nåværende`;

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-6 sm:px-6 sm:py-8">
      {/* Eyebrow */}
      <p className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">
        PlayerHQ · Meg · Abonnement
      </p>

      {/* Header */}
      <header className="mt-2 mb-6">
        <h1 className="font-display text-[30px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground sm:text-4xl">
          Din plan, betaling og <Accent>faktura</Accent>
        </h1>
        <p className="mt-2.5 max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
          Du står på Gratis-planen. Oppgrader til Pro for AI-coach,
          egendefinerte økter og direkte kontakt med coach.
        </p>
      </header>

      <div className="space-y-6">
        {/* 1 · Nåværende plan */}
        <CurrentPlanCard data={data} />

        {/* 2 · Sammenlign planer */}
        <div>
          <SectionHeader
            title="Sammenlign planer"
            status={statusTekst}
            link={{ label: "Endre plan", href: data.hrefs.endrePlan }}
          />
          <ComparePlanCard pris={data.proPris} features={data.proFeatures} />
        </div>

        {/* 3 · Faktura-historikk */}
        <InvoiceHistory fakturaer={data.fakturaer} />
      </div>
    </div>
  );
}
