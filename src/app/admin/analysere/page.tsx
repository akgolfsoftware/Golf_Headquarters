/**
 * /admin/analysere — AgencyOS Innsikt hub
 * Design: hubs-coach.jsx (CoachInnsikt)
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

import {
  BarChart3,
  CheckCheck,
  ClipboardCheck,
  FileBarChart,
  Flag,
  HeartPulse,
  MessageSquare,
  Wallet,
} from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  HubFrame,
  HubHeader,
  HubStatSep,
  HubCard,
  HubPill,
  HubSparkline,
} from "@/components/hubs";
import { HubActions } from "./_hub-actions";

export const dynamic = "force-dynamic";

function kr(ore: number): string {
  return `kr ${Math.round(ore / 100).toLocaleString("nb-NO")}`;
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
    <HubFrame>
      <HubHeader
        eyebrow="AGENCYOS · INNSIKT"
        title="Innsikt over"
        titleItalic="stallen"
        sub="Stall-statistikk, tester, godkjenninger og rapporter."
        actions={
          <HubActions
            stats={[
              { label: "Spillere", value: String(spillere) },
              { label: "Overdue tester", value: String(overdueTester) },
              { label: "Godkjenninger venter", value: String(godkjenningerVenter) },
            ]}
          />
        }
        stats={
          <>
            <span>
              <strong>{spillere}</strong> spillere
            </span>
            <HubStatSep />
            <span className={overdueTester > 0 ? "warn-dot" : undefined}>
              {overdueTester > 0 ? <span /> : null}
              <strong>{overdueTester} overdue</strong> tester
            </span>
            <HubStatSep />
            <span className={godkjenningerVenter > 0 ? "warn-dot" : undefined}>
              {godkjenningerVenter > 0 ? <span /> : null}
              <strong>{godkjenningerVenter}</strong> godkjenninger venter
            </span>
          </>
        }
      />

      <section className="hub-grid">
        <HubCard
          href="/admin/lag-snitt"
          icon={BarChart3}
          eyebrow="01 · OVERSIKT"
          title="Lag-snitt"
          data="Pyramide-snitt"
          sub="Tek · Slag · Fys · Spill · Turnering"
          cta="Se trender →"
        />
        <HubCard
          href="/admin/tester"
          icon={ClipboardCheck}
          eyebrow="02 · MÅLINGER"
          title="Tester"
          data={overdueTester > 0 ? `${overdueTester} overdue` : "Ingen overdue"}
          sub="Tildelte tester forfalt uten resultat"
          statusPill={
            overdueTester > 0 ? (
              <HubPill kind="danger" dot="d-danger">
                {overdueTester} OVERDUE
              </HubPill>
            ) : (
              <HubPill kind="ok" dot="d-ok">
                AJOUR
              </HubPill>
            )
          }
          cta="Behandle →"
        />
        <HubCard
          href="/admin/godkjenninger"
          icon={CheckCheck}
          eyebrow="03 · INNBOKS"
          title="Godkjenninger"
          data={`${godkjenningerVenter} venter`}
          sub="Plan-endringer foreslått av spillerne"
          statusPill={
            godkjenningerVenter > 0 ? (
              <HubPill kind="warn" dot="d-warn">
                {godkjenningerVenter} VENTER
              </HubPill>
            ) : (
              <HubPill kind="ok" dot="d-ok">
                TOMT
              </HubPill>
            )
          }
          cta="Gå gjennom →"
        />
        <HubCard
          href="/admin/foresporsler"
          icon={MessageSquare}
          eyebrow="04 · DIALOG"
          title="Forespørsler"
          data={`${foresporslerVenter} ubehandlede`}
          sub="Booking-ønsker fra spillerne"
          statusPill={
            foresporslerVenter > 0 ? (
              <HubPill kind="warn" dot="d-warn">
                {foresporslerVenter} VENTER
              </HubPill>
            ) : (
              <HubPill kind="ok" dot="d-ok">
                INBOX 0
              </HubPill>
            )
          }
          tone={foresporslerVenter > 0 ? "default" : "muted"}
          cta="Se historikk →"
        />
        <HubCard
          href="/admin/reports"
          icon={FileBarChart}
          eyebrow="05 · EKSPORT"
          title="Rapporter"
          data="Eksport"
          sub="Generer og last ned stall-rapporter"
          cta="Åpne →"
        />
        <HubCard
          href="/admin/runder"
          icon={Flag}
          eyebrow="06 · KONKURRANSE"
          title="Runder"
          data={`${runderTotalt} logget`}
          sub={`${runderDenneMnd} denne mnd`}
          visual={<HubSparkline variant="up" />}
          cta="Se runder →"
        />
        <HubCard
          href="/admin/okonomi"
          icon={Wallet}
          eyebrow="07 · ØKONOMI"
          title="Finance"
          data={antallFakturaer > 0 ? kr(nettoOre) : "—"}
          sub={
            antallFakturaer > 0
              ? `${deltaTekst} mot forrige · ${antallFakturaer} ${antallFakturaer === 1 ? "betaling" : "betalinger"}`
              : "Ingen betalinger denne måneden"
          }
          statusPill={
            inntektDelta != null ? (
              <HubPill kind={inntektDelta >= 0 ? "ok" : "warn"} dot={inntektDelta >= 0 ? "d-ok" : "d-warn"}>
                {deltaTekst}
              </HubPill>
            ) : undefined
          }
          cta="Detaljer →"
        />
        <HubCard
          href="/admin/tilstander"
          icon={HeartPulse}
          eyebrow="08 · HELSE"
          title="Tilstander"
          data={skader > 0 ? `${skader} ${skader === 1 ? "registrert skade" : "registrerte skader"}` : "Ingen skader"}
          sub="Pågående skade-/permisjonssaker"
          statusPill={
            skader > 0 ? (
              <HubPill kind="warn" dot="d-warn">
                {skader} {skader === 1 ? "SKADE" : "SKADER"}
              </HubPill>
            ) : (
              <HubPill kind="ok" dot="d-ok">
                FRISK
              </HubPill>
            )
          }
          cta="Se logger →"
        />
      </section>
    </HubFrame>
  );
}
