/**
 * /admin/analysere — AgencyOS Innsikt hub
 * Design: hubs-coach.jsx (CoachInnsikt)
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
  PyramidMini,
  HubSparkline,
} from "@/components/hubs";
import { HubActions } from "./_hub-actions";

export const dynamic = "force-dynamic";

export default async function AnalyserePage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  // Ekte tall fra databasen (header + matchende kort). Resten av kort-
  // teksten (breakdowns, +12%-trend) mangler kilde og står som design-seed.
  const [antallSpillere, overdueTester, ventendeGodkjenninger] =
    await Promise.all([
      prisma.user.count({ where: { role: "PLAYER" } }).catch(() => 0),
      prisma.testAssignment
        .count({
          where: { status: "OPEN", dueDate: { lt: new Date() } },
        })
        .catch(() => 0),
      prisma.planAction
        .count({ where: { status: "PENDING" } })
        .catch(() => 0),
    ]);

  return (
    <HubFrame>
      <HubHeader
        eyebrow="AGENCYOS · COACH"
        title="Innsikt over"
        titleItalic="stallen"
        sub="Stall-statistikk, tester, godkjenninger og rapporter."
        actions={
          <HubActions
            stats={[
              { label: "Spillere", value: String(antallSpillere) },
              { label: "Overdue tester", value: String(overdueTester) },
              {
                label: "Godkjenninger venter",
                value: String(ventendeGodkjenninger),
              },
              { label: "Endring mot forrige mnd", value: "+12%" },
            ]}
          />
        }
        stats={
          <>
            <span>
              <strong>{antallSpillere}</strong> spillere
            </span>
            <HubStatSep />
            <span className="warn-dot">
              <span />
              <strong>{overdueTester} overdue</strong> tester
            </span>
            <HubStatSep />
            <span className="warn-dot">
              <span />
              <strong>{ventendeGodkjenninger}</strong> godkjenninger venter
            </span>
            <HubStatSep />
            <span>
              <strong>+12%</strong> mot forrige mnd
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
          data="Pyramide-snitt · Q2 2026"
          sub="Tek 32% · Slag 28% · Fys 18% · Spill 14% · Turn 8%"
          visual={<PyramidMini />}
          cta="Se trender →"
        />
        <HubCard
          href="/admin/tester"
          icon={ClipboardCheck}
          eyebrow="02 · MÅLINGER"
          title="Tester"
          data={`${overdueTester} overdue`}
          sub="CMJ · Squat · 5-iron · Wedge"
          statusPill={
            <HubPill kind="danger" dot="d-danger">
              {overdueTester} OVERDUE
            </HubPill>
          }
          cta="Behandle →"
        />
        <HubCard
          href="/admin/godkjenninger"
          icon={CheckCheck}
          eyebrow="03 · INNBOKS"
          title="Godkjenninger"
          data={`${ventendeGodkjenninger} venter`}
          sub="3 plan-revisjon · 4 runder · 1 utstyr"
          statusPill={
            <HubPill kind="warn" dot="d-warn">
              {ventendeGodkjenninger} VENTER
            </HubPill>
          }
          cta="Gå gjennom →"
        />
        <HubCard
          href="/admin/foresporsler"
          icon={MessageSquare}
          eyebrow="04 · DIALOG"
          title="Forespørsler"
          data="0 ubehandlete"
          sub="Sist: 24. mai · 11:48 — alt besvart"
          statusPill={
            <HubPill kind="ok" dot="d-ok">
              INBOX 0
            </HubPill>
          }
          tone="muted"
          cta="Se historikk →"
        />
        <HubCard
          href="/admin/reports"
          icon={FileBarChart}
          eyebrow="05 · EKSPORT"
          title="Rapporter"
          data="Siste generert: 23. mai"
          sub="Mnd-rapport mai · 38 spillere"
          cta="Generer ny →"
        />
        <HubCard
          href="/admin/runder"
          icon={Flag}
          eyebrow="06 · KONKURRANSE"
          title="Runder"
          data="47 logget"
          sub="12 denne mnd · snitt SG +0,8"
          visual={<HubSparkline variant="up" />}
          cta="Se runder →"
        />
        <HubCard
          href="/admin/finance"
          icon={Wallet}
          eyebrow="07 · ØKONOMI"
          title="Finance"
          data="kr 36 753"
          sub="+12% mot forrige · 23 fakturaer"
          statusPill={
            <HubPill kind="ok" dot="d-ok">
              +12%
            </HubPill>
          }
          cta="Detaljer →"
        />
        <HubCard
          href="/admin/tilstander"
          icon={HeartPulse}
          eyebrow="08 · HELSE"
          title="Tilstander"
          data="2 registrerte skader"
          sub="Sondre H. — handledd · Iben L. — kne"
          statusPill={
            <HubPill kind="warn" dot="d-warn">
              2 SKADER
            </HubPill>
          }
          cta="Se logger →"
        />
      </section>
    </HubFrame>
  );
}
