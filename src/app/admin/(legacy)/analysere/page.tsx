/**
 * /admin/analysere — AgencyOS Innsikt hub
 *
 * v13-kalibrert (design-bølge D2): AgPage + AgPageHead + nav-kort komponert
 * lokalt med Tailwind-tokens (erstatter gamle HubFrame/hubs.css med rå hex).
 *
 * Server component: alle tall hentes fra Prisma. Metrikker uten ekte kilde
 * vises som «—» eller utelates — aldri fabrikerte verdier (CLAUDE.md-regel).
 *
 * Kilder:
 *   - Spillere          : User (role=PLAYER, ikke slettet)
 *   - Overdue tester    : TestAssignment (OPEN, dueDate < nå)
 *   - Godkjenninger     : PlanAction (PENDING) — samme som /admin/godkjenninger
 *   - Forespørsler      : SessionRequest (PENDING) — samme som /admin/foresporsler
 *   - Runder            : Round (totalt + denne mnd)
 *   - Finance           : Payment (netto denne mnd + delta mot forrige mnd)
 *   - Tilstander        : Leave (isInjury, pågående)
 */

import Link from "next/link";
import {
  BarChart3,
  CheckCheck,
  ClipboardCheck,
  FileBarChart,
  Flag,
  HeartPulse,
  MessageSquare,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgChip, AgPage, AgPageHead } from "@/components/admin/agencyos/ui";
import { cn } from "@/lib/utils";
import { HubActions } from "./_hub-actions";

export const dynamic = "force-dynamic";

function kr(ore: number): string {
  return `kr ${Math.round(ore / 100).toLocaleString("nb-NO")}`;
}

/** Nav-kort for hub — lokal v13-komposisjon (ui.tsx-tokens, ingen hubs.css). */
function HubNavCard({
  href,
  icon: Icon,
  eyebrow,
  title,
  data,
  sub,
  chip,
  muted = false,
  cta = "Åpne →",
}: {
  href: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  data: ReactNode;
  sub?: ReactNode;
  chip?: ReactNode;
  muted?: boolean;
  cta?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[200px] flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_28px_-8px_hsl(var(--foreground)/0.10)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
          <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        {chip}
      </div>
      <div>
        <div className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {eyebrow}
        </div>
        <h3 className="mt-1 font-display text-lg font-semibold leading-[1.15] tracking-[-0.015em] text-foreground">
          {title}
        </h3>
      </div>
      <div className="h-px bg-border/50" />
      <div className="flex flex-1 flex-col gap-1.5">
        <div className={cn("font-mono text-[13px] font-bold leading-[1.25]", muted ? "text-muted-foreground" : "text-foreground")}>
          {data}
        </div>
        {sub && (
          <div className="font-mono text-[10.5px] leading-[1.4] text-muted-foreground">{sub}</div>
        )}
      </div>
      <div className="mt-auto pt-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.10em] text-primary transition-colors group-hover:text-foreground">
        {cta}
      </div>
    </Link>
  );
}

export default async function AnalyserePage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const now = new Date();
  const mndStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const forrigeMndStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    spillere,
    overdueTester,
    godkjenningerVenter,
    foresporslerVenter,
    runderTotalt,
    runderDenneMnd,
    skader,
    inntektDenneMnd,
    inntektForrigeMnd,
  ] = await Promise.all([
    prisma.user.count({ where: { role: "PLAYER", deletedAt: null } }),
    prisma.testAssignment.count({
      where: { status: "OPEN", dueDate: { lt: now } },
    }),
    prisma.planAction.count({ where: { status: "PENDING" } }),
    prisma.sessionRequest.count({ where: { status: "PENDING" } }),
    prisma.round.count(),
    prisma.round.count({ where: { playedAt: { gte: mndStart } } }),
    prisma.leave.count({
      where: {
        isInjury: true,
        startAt: { lte: now },
        OR: [{ endAt: null }, { endAt: { gt: now } }],
      },
    }),
    prisma.payment.aggregate({
      where: {
        status: { in: ["SUCCEEDED", "PARTIALLY_REFUNDED"] },
        paidAt: { gte: mndStart, lt: now },
      },
      _sum: { amountOre: true, amountRefundedOre: true },
      _count: true,
    }),
    prisma.payment.aggregate({
      where: {
        status: { in: ["SUCCEEDED", "PARTIALLY_REFUNDED"] },
        paidAt: { gte: forrigeMndStart, lt: mndStart },
      },
      _sum: { amountOre: true, amountRefundedOre: true },
    }),
  ]);

  // Finance: netto = brutto − refundert (samme som /admin/okonomi).
  const nettoOre =
    (inntektDenneMnd._sum.amountOre ?? 0) - (inntektDenneMnd._sum.amountRefundedOre ?? 0);
  const forrigeNettoOre =
    (inntektForrigeMnd._sum.amountOre ?? 0) - (inntektForrigeMnd._sum.amountRefundedOre ?? 0);
  const inntektDelta =
    forrigeNettoOre > 0
      ? Math.round(((nettoOre - forrigeNettoOre) / forrigeNettoOre) * 100)
      : null; // ingen forrige-mnd-grunnlag → ikke fabrikkér prosent
  const deltaTekst =
    inntektDelta != null ? `${inntektDelta >= 0 ? "+" : ""}${inntektDelta}%` : "—";
  const antallFakturaer = inntektDenneMnd._count;

  return (
    <AgPage>
      <AgPageHead
        eyebrow="AgencyOS · Innsikt"
        title="Innsikt over"
        italic="stallen"
        lead={
          <>
            Stall-statistikk, tester, godkjenninger og rapporter.{" "}
            <b className="font-semibold text-foreground">{spillere}</b> spillere ·{" "}
            <b className="font-semibold text-foreground">{overdueTester}</b> overdue tester ·{" "}
            <b className="font-semibold text-foreground">{godkjenningerVenter}</b> godkjenninger
            venter.
          </>
        }
        actions={
          <HubActions
            stats={[
              { label: "Spillere", value: String(spillere) },
              { label: "Overdue tester", value: String(overdueTester) },
              { label: "Godkjenninger venter", value: String(godkjenningerVenter) },
            ]}
          />
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <HubNavCard
          href="/admin/lag-snitt"
          icon={BarChart3}
          eyebrow="01 · Oversikt"
          title="Lag-snitt"
          data="Pyramide-snitt"
          sub="Tek · Slag · Fys · Spill · Turnering"
          cta="Se trender →"
        />
        <HubNavCard
          href="/admin/tester"
          icon={ClipboardCheck}
          eyebrow="02 · Målinger"
          title="Tester"
          data={overdueTester > 0 ? `${overdueTester} overdue` : "Ingen overdue"}
          sub="Tildelte tester forfalt uten resultat"
          chip={
            overdueTester > 0 ? (
              <AgChip tone="alert">{overdueTester} overdue</AgChip>
            ) : (
              <AgChip tone="ok">Ajour</AgChip>
            )
          }
          cta="Behandle →"
        />
        <HubNavCard
          href="/admin/godkjenninger"
          icon={CheckCheck}
          eyebrow="03 · Innboks"
          title="Godkjenninger"
          data={`${godkjenningerVenter} venter`}
          sub="Plan-endringer foreslått av spillerne"
          chip={
            godkjenningerVenter > 0 ? (
              <AgChip tone="warn">{godkjenningerVenter} venter</AgChip>
            ) : (
              <AgChip tone="ok">Tomt</AgChip>
            )
          }
          cta="Gå gjennom →"
        />
        <HubNavCard
          href="/admin/foresporsler"
          icon={MessageSquare}
          eyebrow="04 · Dialog"
          title="Forespørsler"
          data={`${foresporslerVenter} ubehandlede`}
          sub="Booking-ønsker fra spillerne"
          chip={
            foresporslerVenter > 0 ? (
              <AgChip tone="warn">{foresporslerVenter} venter</AgChip>
            ) : (
              <AgChip tone="ok">Inbox 0</AgChip>
            )
          }
          muted={foresporslerVenter === 0}
          cta="Se historikk →"
        />
        <HubNavCard
          href="/admin/reports"
          icon={FileBarChart}
          eyebrow="05 · Eksport"
          title="Rapporter"
          data="Eksport"
          sub="Generer og last ned stall-rapporter"
          cta="Åpne →"
        />
        <HubNavCard
          href="/admin/runder"
          icon={Flag}
          eyebrow="06 · Konkurranse"
          title="Runder"
          data={`${runderTotalt} logget`}
          sub={`${runderDenneMnd} denne mnd`}
          cta="Se runder →"
        />
        <HubNavCard
          href="/admin/okonomi"
          icon={Wallet}
          eyebrow="07 · Økonomi"
          title="Finance"
          data={antallFakturaer > 0 ? kr(nettoOre) : "—"}
          sub={
            antallFakturaer > 0
              ? `${deltaTekst} mot forrige · ${antallFakturaer} ${antallFakturaer === 1 ? "betaling" : "betalinger"}`
              : "Ingen betalinger denne måneden"
          }
          chip={
            inntektDelta != null ? (
              <AgChip tone={inntektDelta >= 0 ? "ok" : "warn"}>{deltaTekst}</AgChip>
            ) : undefined
          }
          cta="Detaljer →"
        />
        <HubNavCard
          href="/admin/tilstander"
          icon={HeartPulse}
          eyebrow="08 · Helse"
          title="Tilstander"
          data={skader > 0 ? `${skader} ${skader === 1 ? "registrert skade" : "registrerte skader"}` : "Ingen skader"}
          sub="Pågående skade-/permisjonssaker"
          chip={
            skader > 0 ? (
              <AgChip tone="warn">
                {skader} {skader === 1 ? "skade" : "skader"}
              </AgChip>
            ) : (
              <AgChip tone="ok">Frisk</AgChip>
            )
          }
          cta="Se logger →"
        />
      </section>
    </AgPage>
  );
}
