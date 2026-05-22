/**
 * /admin/gjennomfore — CoachHQ Gjennomføre hovedseksjon.
 * Tabs: Kalender / Bookinger / Anlegg / Tilgjengelighet / Live
 */

import Link from "next/link";
import { ArrowRight, Calendar, ClipboardCheck, MapPin, Clock, Activity } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AthleticButton, AthleticEyebrow } from "@/components/athletic";
import { TabBar, type TabItem } from "@/components/ds/tab-bar";

export const dynamic = "force-dynamic";

const VALID_TABS = ["kalender", "bookinger", "anlegg", "tilgjengelighet", "live"] as const;

const TABS: TabItem[] = [
  { id: "kalender", label: "Kalender" },
  { id: "bookinger", label: "Bookinger" },
  { id: "anlegg", label: "Anlegg" },
  { id: "tilgjengelighet", label: "Tilgjengelighet" },
  { id: "live", label: "Live" },
];

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function GjennomforePage({ searchParams }: Props) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;
  const tab = VALID_TABS.includes(params.tab as (typeof VALID_TABS)[number])
    ? (params.tab as (typeof VALID_TABS)[number])
    : "kalender";

  const [bookingCount, anleggCount, liveCount] = await Promise.all([
    prisma.booking
      .count({ where: { status: "CONFIRMED", startAt: { gte: new Date() } } })
      .catch(() => 0),
    prisma.location.count().catch(() => 0),
    prisma.trainingSessionV2
      .count({ where: { status: "IN_PROGRESS" } })
      .catch(() => 0),
  ]);

  const tabsWithCounts: TabItem[] = TABS.map((t) => {
    if (t.id === "bookinger") return { ...t, count: bookingCount };
    if (t.id === "anlegg") return { ...t, count: anleggCount };
    if (t.id === "live") return { ...t, count: liveCount };
    return t;
  });

  return (
    <div className="space-y-5 px-4 py-6 md:px-8 md:py-8 lg:px-12">
      <section className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-accent">
          <Calendar className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <div>
          <AthleticEyebrow>COACHHQ · GJENNOMFØRE</AthleticEyebrow>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Daglig{" "}
            <em
              className="font-normal not-italic"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                color: "#005840",
              }}
            >
              drift
            </em>
          </h1>
          <p className="text-sm text-muted-foreground">
            Kalender, bookinger, anlegg, tilgjengelighet og live-økter.
          </p>
        </div>
      </section>

      <TabBar tabs={tabsWithCounts} defaultTab="kalender" />

      <div className="min-h-[400px]">
        {tab === "kalender" ? (
          <SummaryCard
            eyebrow="UKE-/MÅNED-VISNING"
            title="Coach-kalender"
            description="Drag-drop økter, kapasitet, Google Cal-sync."
            href="/admin/kalender"
            icon={Calendar}
          />
        ) : null}
        {tab === "bookinger" ? (
          <SummaryCard
            eyebrow={`${bookingCount} KOMMENDE BOOKINGER`}
            title="Booking-administrasjon"
            description="Bekrefte/avvise, refund, reschedule."
            href="/admin/bookinger"
            icon={ClipboardCheck}
          />
        ) : null}
        {tab === "anlegg" ? (
          <SummaryCard
            eyebrow={`${anleggCount} ANLEGG`}
            title="Lokasjoner og fasiliteter"
            description="GFGK, Mulligan Indoor — åpningstider, drill-bibliotek."
            href="/admin/anlegg"
            icon={MapPin}
          />
        ) : null}
        {tab === "tilgjengelighet" ? (
          <SummaryCard
            eyebrow="COACH-TILGJENGELIGHET"
            title="Tilgjengelighets-vindu"
            description="Sett tider hvor spillere kan booke deg."
            href="/admin/availability"
            icon={Clock}
          />
        ) : null}
        {tab === "live" ? (
          <SummaryCard
            eyebrow={`${liveCount} AKTIVE ØKTER`}
            title="Live-økt monitor"
            description="Se spillere som logger økter akkurat nå."
            href="/admin/kalender"
            icon={Activity}
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
