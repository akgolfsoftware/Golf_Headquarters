/**
 * /admin/organisasjon — CoachHQ Organisasjon hovedseksjon.
 * Tabs: Team / Økonomi / Agents / Integrasjoner / Audit / Innstillinger
 */

import Link from "next/link";
import {
  ArrowRight,
  Users,
  DollarSign,
  Bot,
  Plug,
  History,
  Settings,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AthleticButton, AthleticEyebrow } from "@/components/athletic";
import { TabBar, type TabItem } from "@/components/ds/tab-bar";

export const dynamic = "force-dynamic";

const VALID_TABS = [
  "team",
  "okonomi",
  "agents",
  "integrasjoner",
  "audit",
  "innstillinger",
] as const;

const TABS: TabItem[] = [
  { id: "team", label: "Team" },
  { id: "okonomi", label: "Økonomi" },
  { id: "agents", label: "AI-agenter" },
  { id: "integrasjoner", label: "Integrasjoner" },
  { id: "audit", label: "Audit-log" },
  { id: "innstillinger", label: "Innstillinger" },
];

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function OrganisasjonPage({ searchParams }: Props) {
  await requirePortalUser({ allow: ["ADMIN"] });
  const params = await searchParams;
  const tab = VALID_TABS.includes(params.tab as (typeof VALID_TABS)[number])
    ? (params.tab as (typeof VALID_TABS)[number])
    : "team";

  return (
    <div className="space-y-5 px-4 py-6 md:px-8 md:py-8 lg:px-12">
      <section className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-accent">
          <Users className="h-6 w-6" strokeWidth={1.75} />
        </span>
        <div>
          <AthleticEyebrow>COACHHQ · ORGANISASJON</AthleticEyebrow>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Drift av{" "}
            <em
              className="font-normal not-italic"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                color: "#005840",
              }}
            >
              akademiet
            </em>
          </h1>
          <p className="text-sm text-muted-foreground">
            Team, økonomi, AI-agenter, integrasjoner, audit og innstillinger.
          </p>
        </div>
      </section>

      <TabBar tabs={TABS} defaultTab="team" />

      <div className="min-h-[400px]">
        {tab === "team" ? (
          <SummaryCard
            eyebrow="TEAM"
            title="Coacher og invitasjoner"
            description="Inviter coacher, sett roller, deactiver konti."
            href="/admin/team"
            icon={Users}
          />
        ) : null}
        {tab === "okonomi" ? (
          <SummaryCard
            eyebrow="ØKONOMI"
            title="Faktura + abonnement"
            description="Stripe-dashboard, månedlig regnskap, refund-historikk."
            href="/admin/finance"
            icon={DollarSign}
          />
        ) : null}
        {tab === "agents" ? (
          <SummaryCard
            eyebrow="AI-AGENTER"
            title="Agent-dashboard"
            description="AI Caddie, plan-watcher, periodiserings-agent — manuelt trigger."
            href="/admin/agents"
            icon={Bot}
          />
        ) : null}
        {tab === "integrasjoner" ? (
          <SummaryCard
            eyebrow="INTEGRASJONER"
            title="API-nøkler + webhooks"
            description="Google Cal, Stripe, Notion, MCP-server, Trackman."
            href="/admin/integrasjoner"
            icon={Plug}
          />
        ) : null}
        {tab === "audit" ? (
          <SummaryCard
            eyebrow="AUDIT-LOG"
            title="Endringslogg"
            description="Hvem gjorde hva, når. Filterbart per bruker og handling."
            href="/admin/audit-log"
            icon={History}
          />
        ) : null}
        {tab === "innstillinger" ? (
          <SummaryCard
            eyebrow="INNSTILLINGER"
            title="System-innstillinger"
            description="Tilgang, sikkerhet, kalender-config, API-nøkler."
            href="/admin/settings"
            icon={Settings}
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
