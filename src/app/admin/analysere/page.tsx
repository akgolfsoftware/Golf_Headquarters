/**
 * /admin/analysere — CoachHQ Analysere hovedseksjon.
 * Tabs: Stall / Tester / Innboks / Godkjenninger / Forespørsler / Rapporter
 */

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  TestTube,
  Inbox,
  CheckCircle2,
  Mail,
  FileText,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AthleticButton, AthleticEyebrow } from "@/components/athletic";
import { TabBar, type TabItem } from "@/components/ds/tab-bar";

export const dynamic = "force-dynamic";

const VALID_TABS = [
  "stall",
  "tester",
  "innboks",
  "godkjenninger",
  "foresporsler",
  "rapporter",
] as const;

const TABS: TabItem[] = [
  { id: "stall", label: "Stall" },
  { id: "tester", label: "Tester" },
  { id: "innboks", label: "Innboks" },
  { id: "godkjenninger", label: "Godkjenninger" },
  { id: "foresporsler", label: "Forespørsler" },
  { id: "rapporter", label: "Rapporter" },
];

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function AnalyserePage({ searchParams }: Props) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;
  const tab = VALID_TABS.includes(params.tab as (typeof VALID_TABS)[number])
    ? (params.tab as (typeof VALID_TABS)[number])
    : "stall";

  const [godkjenningerCount, foresporslerCount, testerCount] = await Promise.all([
    prisma.planAdjustment.count({ where: { status: "PENDING" } }).catch(() => 0),
    prisma.sessionRequest.count({ where: { status: "PENDING" } }).catch(() => 0),
    prisma.testResult.count().catch(() => 0),
  ]);

  const tabsWithCounts: TabItem[] = TABS.map((t) => {
    if (t.id === "godkjenninger") return { ...t, count: godkjenningerCount };
    if (t.id === "foresporsler") return { ...t, count: foresporslerCount };
    if (t.id === "tester") return { ...t, count: testerCount };
    return t;
  });

  return (
    <div className="space-y-5 px-4 py-6 md:px-8 md:py-8 lg:px-12">
      <section className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-accent">
          <BarChart3 className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <div>
          <AthleticEyebrow>COACHHQ · ANALYSERE</AthleticEyebrow>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Innsikt over{" "}
            <em
              className="font-normal not-italic"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                color: "#005840",
              }}
            >
              stallen
            </em>
          </h1>
          <p className="text-sm text-muted-foreground">
            Stall-statistikk, tester, innboks, godkjenninger og rapporter.
          </p>
        </div>
      </section>

      <TabBar tabs={tabsWithCounts} defaultTab="stall" />

      <div className="min-h-[400px]">
        {tab === "stall" ? (
          <SummaryCard
            eyebrow="STALL-AGGREGAT"
            title="Stall-analyse"
            description="HCP-trend, SG-aggregat, lag-snitt, kohort-sammenligning."
            href="/admin/analyse"
            icon={BarChart3}
          />
        ) : null}
        {tab === "tester" ? (
          <SummaryCard
            eyebrow={`${testerCount} TEST-RESULTATER`}
            title="Test-resultater per kohort"
            description="CMJ, broad jump, putting-test — sammenlign over tid."
            href="/admin/tester"
            icon={TestTube}
          />
        ) : null}
        {tab === "innboks" ? (
          <SummaryCard
            eyebrow="INNBOKS"
            title="Coach-innboks"
            description="Meldinger og plan-justeringer som venter på behandling."
            href="/admin/innboks"
            icon={Inbox}
          />
        ) : null}
        {tab === "godkjenninger" ? (
          <SummaryCard
            eyebrow={`${godkjenningerCount} VENTER`}
            title="Godkjenninger"
            description="Plan-justeringer og spillerønsker som trenger ditt OK."
            href="/admin/godkjenninger"
            icon={CheckCircle2}
          />
        ) : null}
        {tab === "foresporsler" ? (
          <SummaryCard
            eyebrow={`${foresporslerCount} FORESPØRSLER`}
            title="Spiller-forespørsler"
            description="Ønsker om økt, drill-tilpasninger, ekstra coaching."
            href="/admin/foresporsler"
            icon={Mail}
          />
        ) : null}
        {tab === "rapporter" ? (
          <SummaryCard
            eyebrow="RAPPORTER"
            title="Per-spiller og stall-rapporter"
            description="Auto-genererte PDF/CSV-rapporter for foreldre og styre."
            href="/admin/reports"
            icon={FileText}
          />
        ) : null}
      </div>
    </div>
  );
}

type CardSpec = {
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
};

function SummaryCard({ eyebrow, title, description, href, icon: Icon }: CardSpec) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <AthleticEyebrow>{eyebrow}</AthleticEyebrow>
          <h2 className="font-display mt-1 text-xl font-semibold tracking-tight">
            <Icon className="mr-1 inline h-5 w-5 text-primary" strokeWidth={1.75} />
            {title}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <Link href={href}>
          <AthleticButton variant="lime" size="md">
            Åpne
            <ArrowRight className="h-4 w-4" />
          </AthleticButton>
        </Link>
      </div>
    </div>
  );
}
