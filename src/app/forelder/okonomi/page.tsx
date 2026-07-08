/**
 * Foreldreportal · /forelder/okonomi — mobil-first (430px).
 *
 * Lese-først innsyn i barnas økonomi: abonnement-status (tier, credits, neste
 * trekk) + utestående betalinger + siste betalinger. Full faktura-historikk
 * ligger på /forelder/fakturaer — denne siden er sammendraget.
 *
 * Ekte data: prisma.subscription + prisma.payment per koblet barn. Beløp i øre
 * (Int), formatert via Intl. Tall fra DB — aldri hardkodet. Tom DB → tomtilstand.
 * DS-tokens + athletic-primitiver. Ingen hex, ingen emoji (kun lucide).
 */

import { Tag } from "@/components/athletic/golfdata";
import Link from "next/link";
import {
  AlertTriangle,
  ChevronRight,
  Coins,
  CreditCard,
  ReceiptText,
  Sparkles,
  Wallet,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentBarnForForelder } from "@/lib/forelder";
import { prisma } from "@/lib/prisma";
import { ForelderHero } from "@/components/forelder/forelder-hero";
// eslint-disable-next-line no-restricted-imports -- TODO(opprydding): migrer til golfdata (Fase 3/4)
import { KpiCard, KpiStrip } from "@/components/athletic";
import type {
  PaymentStatus,
  SubscriptionStatus,
  Tier,
} from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const NB_DATO = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});
const NB_DAG_MND = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
});

function kr(ore: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(ore / 100);
}

const UBETALT: PaymentStatus[] = ["PENDING", "FAILED"];

// Abonnement-status → label + tone.
function abonnementStatus(s: SubscriptionStatus): {
  tekst: string;
  variant: "ok" | "warn" | "neutral";
} {
  if (s === "ACTIVE") return { tekst: "Aktivt", variant: "ok" };
  if (s === "TRIALING") return { tekst: "Prøveperiode", variant: "neutral" };
  if (s === "PAST_DUE") return { tekst: "Forfalt", variant: "warn" };
  return { tekst: "Avsluttet", variant: "neutral" };
}

function tierLabel(tier: Tier): string {
  return tier === "PRO" ? "PlayerHQ PRO" : "Gratis";
}

// Faktura-status → pille (matcher oversikt.tsx).
function fakturaPille(s: PaymentStatus): { tekst: string; klasse: string } {
  if (s === "SUCCEEDED")
    return { tekst: "Betalt", klasse: "bg-success/10 text-success" };
  if (s === "FAILED")
    return { tekst: "Feilet", klasse: "bg-destructive/10 text-destructive" };
  if (s === "REFUNDED" || s === "PARTIALLY_REFUNDED")
    return { tekst: "Refundert", klasse: "bg-secondary text-muted-foreground" };
  return { tekst: "Forfaller", klasse: "bg-warning/10 text-warning" };
}

export default async function ForelderOkonomi() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const barn = await hentBarnForForelder(user.id);
  const childIds = barn.map((b) => b.child.id);

  // Tomtilstand — ingen barn koblet.
  if (childIds.length === 0) {
    return (
      <div className="mx-auto max-w-[480px] space-y-6 px-4 pb-24 pt-6">
        <ForelderHero
          eyebrow="Foreldreportal · Økonomi"
          titleLead="Abonnement"
          titleItalic="og betaling"
          sub="Status for abonnement, fakturaer og kommende trekk."
        />
        <IngenBarn />
      </div>
    );
  }

  const [abonnementer, betalinger] = await Promise.all([
    prisma.subscription.findMany({
      where: { userId: { in: childIds } },
      select: {
        userId: true,
        tier: true,
        status: true,
        currentPeriodEnd: true,
        monthlyCredits: true,
        creditsRemaining: true,
      },
    }),
    prisma.payment.findMany({
      where: { userId: { in: childIds } },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        userId: true,
        amountOre: true,
        status: true,
        type: true,
        description: true,
        createdAt: true,
      },
    }),
  ]);

  const abonnementPerBarn = new Map(abonnementer.map((a) => [a.userId, a]));

  // Utestående totalt (PENDING/FAILED) på tvers av barn.
  const ubetalte = betalinger.filter((p) => UBETALT.includes(p.status));
  const utestaaendeOre = ubetalte.reduce((s, p) => s + p.amountOre, 0);

  // Betalt totalt (SUCCEEDED).
  const betaltOre = betalinger
    .filter((p) => p.status === "SUCCEEDED")
    .reduce((s, p) => s + p.amountOre, 0);

  // Aktive coaching-pakker (credits > 0).
  const aktivePakker = abonnementer.filter((a) => a.monthlyCredits > 0).length;

  // Siste 4 betalinger (preview — full historikk på /forelder/fakturaer).
  const sistePayments = betalinger.slice(0, 4);

  return (
    <div className="mx-auto max-w-[480px] space-y-6 px-4 pb-24 pt-6">
      <ForelderHero
        eyebrow="Foreldreportal · Økonomi"
        titleLead="Abonnement"
        titleItalic="og betaling"
        sub={
          barn.length === 1
            ? "Status for abonnement, credits og kommende trekk."
            : `Økonomi-oversikt for ${barn.length} barn.`
        }
      />

      {/* Utestående-varsel */}
      {ubetalte.length > 0 && (
        <Link
          href="/forelder/fakturaer"
          className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4 transition-colors hover:bg-warning/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <AlertTriangle
            className="h-5 w-5 shrink-0 text-warning"
            strokeWidth={1.75}
            aria-hidden
          />
          <div className="min-w-0">
            <div className="text-[13px] font-bold text-foreground">
              {ubetalte.length} utestående betaling
              {ubetalte.length === 1 ? "" : "er"} · {kr(utestaaendeOre)}
            </div>
            <div className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
              Trykk for å se fakturaer
            </div>
          </div>
          <ChevronRight
            className="ml-auto h-4 w-4 shrink-0 text-muted-foreground/60"
            strokeWidth={2}
            aria-hidden
          />
        </Link>
      )}

      {/* KPI */}
      <KpiStrip cols={3} className="gap-3">
        <KpiCard
          label="Utestående"
          value={
            utestaaendeOre > 0
              ? new Intl.NumberFormat("nb-NO").format(
                  Math.round(utestaaendeOre / 100),
                )
              : "0"
          }
          unit="kr"
          size="md"
        />
        <KpiCard
          label="Betalt totalt"
          value={new Intl.NumberFormat("nb-NO").format(
            Math.round(betaltOre / 100),
          )}
          unit="kr"
          size="md"
        />
        <KpiCard label="Pakker" value={aktivePakker} unit="aktive" size="md" />
      </KpiStrip>

      {/* Abonnement per barn */}
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <PanelHead icon={Sparkles} label="ABONNEMENT" />
        <ul className="divide-y divide-border">
          {barn.map((b) => {
            const fornavn = b.child.name.split(" ")[0] ?? b.child.name;
            const ab = abonnementPerBarn.get(b.child.id);
            return (
              <AbonnementRad
                key={b.child.id}
                fornavn={fornavn}
                tier={ab?.tier ?? "GRATIS"}
                status={ab?.status ?? null}
                currentPeriodEnd={ab?.currentPeriodEnd ?? null}
                monthlyCredits={ab?.monthlyCredits ?? 0}
                creditsRemaining={ab?.creditsRemaining ?? 0}
              />
            );
          })}
        </ul>
      </section>

      {/* Siste betalinger */}
      <section className="overflow-hidden rounded-xl border border-border bg-card">
        <PanelHead
          icon={ReceiptText}
          label="SISTE BETALINGER"
          href="/forelder/fakturaer"
          hrefLabel="Se alle"
        />
        {sistePayments.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-8 text-center">
            <Wallet
              className="h-6 w-6 text-muted-foreground/40"
              strokeWidth={1.5}
              aria-hidden
            />
            <p className="mt-2.5 text-[13px] text-muted-foreground">
              Ingen betalinger registrert ennå.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {sistePayments.map((p) => {
              const pille = fakturaPille(p.status);
              return (
                <li
                  key={p.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-semibold text-foreground">
                      {p.description ?? p.type}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                      {NB_DAG_MND.format(p.createdAt)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[13px] font-extrabold tabular-nums tracking-[-0.005em] text-foreground">
                      {kr(p.amountOre)}
                    </span>
                    <span
                      className={`rounded-[4px] px-2 py-0.5 font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] ${pille.klasse}`}
                    >
                      {pille.tekst}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Lesemodus-notis */}
      <div className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-card p-4">
        <CreditCard
          className="h-4 w-4 shrink-0 text-muted-foreground"
          strokeWidth={1.5}
          aria-hidden
        />
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          Abonnement og betaling administreres av spilleren selv. Foreldre-portalen
          gir innsyn — kontakt coachen din ved spørsmål om fakturering.
        </p>
      </div>
    </div>
  );
}

// ── Panel-header (mono-caps + valgfri lenke) ──────────────────────
function PanelHead({
  icon: Icon,
  label,
  href,
  hrefLabel,
}: {
  icon: typeof Sparkles;
  label: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border px-4 py-3">
      <Icon
        className="h-3.5 w-3.5 text-muted-foreground"
        strokeWidth={2}
        aria-hidden
      />
      <span className="font-mono text-[10px] font-extrabold uppercase tracking-[0.12em] text-foreground">
        {label}
      </span>
      {href && hrefLabel && (
        <Link
          href={href}
          className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-primary hover:underline"
        >
          {hrefLabel}
          <ChevronRight className="h-3 w-3" strokeWidth={2} aria-hidden />
        </Link>
      )}
    </div>
  );
}

// ── Abonnement-rad per barn ───────────────────────────────────────
function AbonnementRad({
  fornavn,
  tier,
  status,
  currentPeriodEnd,
  monthlyCredits,
  creditsRemaining,
}: {
  fornavn: string;
  tier: Tier;
  status: SubscriptionStatus | null;
  currentPeriodEnd: Date | null;
  monthlyCredits: number;
  creditsRemaining: number;
}) {
  const erPro = tier === "PRO";
  const st = status ? abonnementStatus(status) : null;
  return (
    <li className="px-4 py-3.5">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14px] font-bold tracking-[-0.005em] text-foreground">
            {fornavn}
          </div>
          <div className="mt-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            {tierLabel(tier)}
          </div>
        </div>
        {st ? (
          <Tag
            variant={st.variant === "ok" ? "up" : st.variant === "warn" ? "outline" : "neutral"}
            style={st.variant === "warn" ? { color: "var(--warning)", borderColor: "var(--warning-border)" } : undefined}
          >
            {st.tekst}
          </Tag>
        ) : (
          <Tag variant="neutral">Ingen</Tag>
        )}
      </div>

      {/* Credits + neste trekk — kun relevant for betalt pakke */}
      {erPro && monthlyCredits > 0 && (
        <dl className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-secondary px-3 py-2">
            <dt className="inline-flex items-center gap-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              <Coins className="h-3 w-3" strokeWidth={1.75} aria-hidden />
              Credits igjen
            </dt>
            <dd className="mt-1 font-mono text-[14px] font-bold tabular-nums text-foreground">
              {creditsRemaining}
              <span className="text-[11px] font-normal text-muted-foreground">
                {" "}
                / {monthlyCredits}
              </span>
            </dd>
          </div>
          <div className="rounded-lg bg-secondary px-3 py-2">
            <dt className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
              Neste trekk
            </dt>
            <dd className="mt-1 font-mono text-[13px] font-bold tabular-nums text-foreground">
              {currentPeriodEnd ? NB_DATO.format(currentPeriodEnd) : "—"}
            </dd>
          </div>
        </dl>
      )}
    </li>
  );
}

// ── Ingen barn koblet ─────────────────────────────────────────────
function IngenBarn() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card px-5 py-12 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-secondary text-muted-foreground">
        <CreditCard className="h-6 w-6" strokeWidth={1.5} aria-hidden />
      </span>
      <p className="mt-4 font-display text-[16px] font-semibold -tracking-[0.01em] text-foreground">
        Ingen barn koblet til kontoen din
      </p>
      <p className="mt-1.5 font-sans text-[13.5px] leading-[1.5] text-muted-foreground">
        Be spilleren sende en invitasjon, eller kontakt coachen din.
      </p>
    </div>
  );
}
