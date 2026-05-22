/**
 * /admin/planlegge — CoachHQ Planlegge hovedseksjon.
 * Tabs: Plan-bygger / Plan-maler / Teknisk plan / Grupper
 */

import Link from "next/link";
import { ArrowRight, ClipboardList, Layers, Target, Users2 } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AthleticButton, AthleticEyebrow } from "@/components/athletic";
import { TabBar, type TabItem } from "@/components/ds/tab-bar";

export const dynamic = "force-dynamic";

const VALID_TABS = ["bygger", "maler", "teknisk", "grupper"] as const;

const TABS: TabItem[] = [
  { id: "bygger", label: "Plan-bygger" },
  { id: "maler", label: "Plan-maler" },
  { id: "teknisk", label: "Teknisk plan" },
  { id: "grupper", label: "Grupper" },
];

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function PlanleggePage({ searchParams }: Props) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;
  const tab = VALID_TABS.includes(params.tab as (typeof VALID_TABS)[number])
    ? (params.tab as (typeof VALID_TABS)[number])
    : "bygger";

  const [planCount, malCount, techCount, groupCount] = await Promise.all([
    prisma.trainingPlan.count().catch(() => 0),
    prisma.planTemplate.count().catch(() => 0),
    prisma.technicalPlan.count({ where: { status: "ACTIVE" } }).catch(() => 0),
    prisma.group.count().catch(() => 0),
  ]);

  const tabsWithCounts: TabItem[] = TABS.map((t) => {
    if (t.id === "bygger") return { ...t, count: planCount };
    if (t.id === "maler") return { ...t, count: malCount };
    if (t.id === "teknisk") return { ...t, count: techCount };
    if (t.id === "grupper") return { ...t, count: groupCount };
    return t;
  });

  return (
    <div className="space-y-5 px-4 py-6 md:px-8 md:py-8 lg:px-12">
      <section className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-accent">
          <ClipboardList className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <div>
          <AthleticEyebrow>COACHHQ · PLANLEGGE</AthleticEyebrow>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Bygg{" "}
            <em
              className="font-normal not-italic"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                color: "#005840",
              }}
            >
              planer
            </em>
          </h1>
          <p className="text-sm text-muted-foreground">
            Treningsplaner, plan-maler, teknisk utviklingsplan og grupper.
          </p>
        </div>
      </section>

      <TabBar tabs={tabsWithCounts} defaultTab="bygger" />

      <div className="min-h-[400px]">
        {tab === "bygger" ? (
          <SummaryCard
            eyebrow={`${planCount} TRENINGSPLANER`}
            title="Plan-bygger"
            description="Drag-and-drop plan med pyramide-fordeling og AI-generering."
            href="/admin/plans"
            icon={ClipboardList}
          />
        ) : null}
        {tab === "maler" ? (
          <SummaryCard
            eyebrow={`${malCount} PLAN-MALER`}
            title="Plan-mal-bibliotek"
            description="Gjenbrukbare maler organisert etter periode og nivå."
            href="/admin/plan-templates"
            icon={Layers}
          />
        ) : null}
        {tab === "teknisk" ? (
          <SummaryCard
            eyebrow={`${techCount} AKTIVE TEKNISKE PLANER`}
            title="Teknisk utviklingsplan"
            description="P1-P8 posisjoner, TrackMan hit-rate, automatisk sync til økter."
            href="/admin/teknisk-plan"
            icon={Target}
          />
        ) : null}
        {tab === "grupper" ? (
          <SummaryCard
            eyebrow={`${groupCount} GRUPPER`}
            title="Gruppe-trening"
            description="Lagslister, fellesøkter, gruppeplaner."
            href="/admin/grupper"
            icon={Users2}
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
