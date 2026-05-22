/**
 * /portal/analysere — PlayerHQ Analysere hovedseksjon.
 * Tabs: Statistikk / SG / Runder / TrackMan / Tester / Innsikt
 */

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  TrendingUp,
  Target,
  Wifi,
  TestTube,
  Lightbulb,
} from "lucide-react";
import { redirect } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getViewMode } from "@/lib/view-mode";
import { prisma } from "@/lib/prisma";
import { AthleticButton, AthleticEyebrow } from "@/components/athletic";
import { TabBar, type TabItem } from "@/components/ds/tab-bar";

export const dynamic = "force-dynamic";

const VALID_TABS = ["statistikk", "sg", "runder", "trackman", "tester", "innsikt"] as const;

const TABS: TabItem[] = [
  { id: "statistikk", label: "Statistikk" },
  { id: "sg", label: "Strokes Gained" },
  { id: "runder", label: "Runder" },
  { id: "trackman", label: "TrackMan" },
  { id: "tester", label: "Tester" },
  { id: "innsikt", label: "Innsikt" },
];

type Props = {
  searchParams: Promise<{ tab?: string }>;
};

export default async function AnalyserePage({ searchParams }: Props) {
  const user = await requirePortalUser();

  const viewMode = await getViewMode();
  if (user.role === "COACH" || user.role === "ADMIN") {
    if (viewMode !== "player") redirect("/admin");
  }
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const params = await searchParams;
  const tab = VALID_TABS.includes(params.tab as (typeof VALID_TABS)[number])
    ? (params.tab as (typeof VALID_TABS)[number])
    : "statistikk";

  const [roundCount, tmCount, testCount, insightCount] = await Promise.all([
    prisma.round.count({ where: { userId: user.id } }).catch(() => 0),
    prisma.trackManSession.count({ where: { userId: user.id } }).catch(() => 0),
    prisma.testResult.count({ where: { userId: user.id } }).catch(() => 0),
    prisma.sgInsight.count({ where: { userId: user.id } }).catch(() => 0),
  ]);

  const tabsWithCounts: TabItem[] = TABS.map((t) => {
    if (t.id === "runder") return { ...t, count: roundCount };
    if (t.id === "trackman") return { ...t, count: tmCount };
    if (t.id === "tester") return { ...t, count: testCount };
    if (t.id === "innsikt") return { ...t, count: insightCount };
    return t;
  });

  return (
    <div className="space-y-5 px-4 py-6 md:px-8 md:py-8 lg:px-12">
      <section className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-accent">
          <BarChart3 className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <div>
          <AthleticEyebrow>PLAYERHQ · ANALYSERE</AthleticEyebrow>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Forstå{" "}
            <em
              className="font-normal not-italic"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                color: "#005840",
              }}
            >
              spillet ditt
            </em>
          </h1>
          <p className="text-sm text-muted-foreground">
            Statistikk, strokes gained, runder, TrackMan, tester og AI-innsikt.
          </p>
        </div>
      </section>

      <TabBar tabs={tabsWithCounts} defaultTab="statistikk" />

      <div className="min-h-[400px]">
        {tab === "statistikk" ? <SummaryCard {...STATISTIKK_CARD} /> : null}
        {tab === "sg" ? <SummaryCard {...SG_CARD} /> : null}
        {tab === "runder" ? <SummaryCard {...RUNDER_CARD} count={roundCount} /> : null}
        {tab === "trackman" ? <SummaryCard {...TRACKMAN_CARD} count={tmCount} /> : null}
        {tab === "tester" ? <SummaryCard {...TESTER_CARD} count={testCount} /> : null}
        {tab === "innsikt" ? <SummaryCard {...INNSIKT_CARD} count={insightCount} /> : null}
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

function SummaryCard({
  eyebrow,
  title,
  description,
  href,
  icon: Icon,
  count,
}: CardSpec & { count?: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <AthleticEyebrow>
            {eyebrow}
            {typeof count === "number" ? ` · ${count} TOTALT` : null}
          </AthleticEyebrow>
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

const STATISTIKK_CARD: CardSpec = {
  eyebrow: "OVERORDNET STATISTIKK",
  title: "Score, fairways, GIR, puttsnitt",
  description:
    "Trend siste 10 / 30 / 90 dager. Sammenlign mot DataGolf-kohort.",
  href: "/portal/statistikk",
  icon: TrendingUp,
};

const SG_CARD: CardSpec = {
  eyebrow: "STROKES GAINED",
  title: "OTT · APP · ARG · PUTT",
  description: "Per-runde-breakdown med DataGolf-baseline.",
  href: "/portal/mal/sg-hub",
  icon: Target,
};

const RUNDER_CARD: CardSpec = {
  eyebrow: "RUNDER",
  title: "Alle dine runder",
  description: "Shot-by-shot, import fra GolfBox, eksport til Excel.",
  href: "/portal/mal/runder",
  icon: Target,
};

const TRACKMAN_CARD: CardSpec = {
  eyebrow: "TRACKMAN",
  title: "Range-data og parameters",
  description:
    "Importer CSV, se key-positions-trend, koble til teknisk plan.",
  href: "/portal/trackman",
  icon: Wifi,
};

const TESTER_CARD: CardSpec = {
  eyebrow: "TESTER",
  title: "Fysiske tester + skill-tester",
  description: "CMJ, broad jump, putting-test. Sammenlign over tid.",
  href: "/portal/tren/tester",
  icon: TestTube,
};

const INNSIKT_CARD: CardSpec = {
  eyebrow: "AI-INNSIKT",
  title: "Hva du må jobbe med",
  description:
    "Auto-genererte innsikter fra SG-data + tester + TrackMan.",
  href: "/portal/innsikt",
  icon: Lightbulb,
};
