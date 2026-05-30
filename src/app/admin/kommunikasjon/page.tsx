/**
 * /admin/kommunikasjon — CoachHQ Kommunikasjon hovedseksjon.
 * Tabs: Innboks / E-postmaler / Notion-prosjekter / Notion-oppgaver
 */

import Link from "next/link";
import { ArrowRight, Inbox, Mail, FolderTree, ListChecks } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AthleticButton, AthleticEyebrow } from "@/components/athletic";
import { TabBar, type TabItem } from "@/components/athletic/tab-bar";

export const dynamic = "force-dynamic";

const VALID_TABS = ["innboks", "epostmaler", "notion-prosjekter", "notion-oppgaver"] as const;

const TABS: TabItem[] = [
  { id: "innboks", label: "Innboks" },
  { id: "epostmaler", label: "E-postmaler" },
  { id: "notion-prosjekter", label: "Notion-prosjekter" },
  { id: "notion-oppgaver", label: "Notion-oppgaver" },
];

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function KommunikasjonPage({ searchParams }: Props) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;
  const tab = VALID_TABS.includes(params.tab as (typeof VALID_TABS)[number])
    ? (params.tab as (typeof VALID_TABS)[number])
    : "innboks";

  return (
    <div className="space-y-6 px-4 py-6 md:px-8 md:py-8 lg:px-12">
      <section className="flex items-center gap-2">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-accent">
          <Mail className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <div>
          <AthleticEyebrow>COACHHQ · KOMMUNIKASJON</AthleticEyebrow>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Holde{" "}
            <em
              className="font-normal not-italic"
              style={{
                fontFamily: "'Inter Tight', sans-serif",
                fontStyle: "italic",
                color: "hsl(var(--primary))",
              }}
            >
              kontakt
            </em>
          </h1>
          <p className="text-sm text-muted-foreground">
            Innboks, e-postmaler, Notion-sync med spillere og foreldre.
          </p>
        </div>
      </section>

      <TabBar tabs={TABS} defaultTab="innboks" />

      <div className="min-h-[400px]">
        {tab === "innboks" ? (
          <SummaryCard
            eyebrow="INNBOKS"
            title="Spiller-meldinger"
            description="Tråd-visning, prioritet-filter, automatisk eskalering > 48t."
            href="/admin/innboks"
            icon={Inbox}
          />
        ) : null}
        {tab === "epostmaler" ? (
          <SummaryCard
            eyebrow="E-POSTMALER"
            title="Resend-templates"
            description="Booking-bekreftelse, refund, reschedule — alle redigerbare."
            href="/admin/email-templates"
            icon={Mail}
          />
        ) : null}
        {tab === "notion-prosjekter" ? (
          <SummaryCard
            eyebrow="NOTION-SYNC"
            title="Prosjekter-database"
            description="2-veis sync til Notion for ekstern dokumentasjon."
            href="/admin/notion-prosjekter"
            icon={FolderTree}
          />
        ) : null}
        {tab === "notion-oppgaver" ? (
          <SummaryCard
            eyebrow="OPPGAVER"
            title="Notion-oppgaver"
            description="Daglige oppgaver synket til Notion (todo-liste)."
            href="/admin/notion-oppgaver"
            icon={ListChecks}
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
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
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
