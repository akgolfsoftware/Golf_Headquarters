// Detalj-side per agent. Viser konfigurasjon, siste kjøringer (fra
// AuditLog hvor action starter med `agent.<agentId>`) og lar coach
// gi tommel opp/ned-feedback per kjøring.

import { notFound } from "next/navigation";
import Link from "next/link";
import { Bot, Sparkles } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { DetailShell } from "@/components/shared/detail-shell";
import { KPICard } from "@/components/ui/kpi-card";
import { AthleticBadge } from "@/components/athletic/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { FeedbackForm } from "./feedback-form";
import { ApprovalActions } from "@/app/admin/approvals/approval-actions";

type AgentKonfig = {
  navn: string;
  beskrivelse: string;
  status: "aktiv" | "beta" | "planlagt";
  sistKjort: string;
};

const AGENT_KONFIG: Record<string, AgentKonfig> = {
  brief: {
    navn: "Daglig brief-agent",
    beskrivelse:
      "Genererer dagens kort-brief til coach: hvem som spilte, hvilke signaler som krever oppfølging, og hva som ligger i kalenderen.",
    status: "aktiv",
    sistKjort: "I dag 06:00",
  },
  periodisering: {
    navn: "Periodiseringsagent",
    beskrivelse:
      "Foreslår uke-allokering for nye treningsplaner basert på spillerens fokusområder, turneringskalender og historisk belastning.",
    status: "aktiv",
    sistKjort: "Ved ny TrainingPlan",
  },
  "vinn-tilbake": {
    navn: "Vinn-tilbake-agent",
    beskrivelse:
      "Identifiserer inaktive spillere (ingen runder/økter siste 30 dager) og foreslår personlig oppfølgings-melding.",
    status: "beta",
    sistKjort: "Ukentlig — mandag 08:00",
  },
  "win-back": {
    navn: "Vinn-tilbake-agent",
    beskrivelse:
      "Identifiserer inaktive spillere (ingen runder/økter siste 30 dager) og foreslår personlig oppfølgings-melding.",
    status: "beta",
    sistKjort: "Ukentlig — mandag 08:00",
  },
  "ai-plan": {
    navn: "AI-plan-agent",
    beskrivelse:
      "Genererer komplett treningsplan-forslag fra coach-prompt + spillerens kontekst (HCP, fokusområder, turneringer). Itereres med feedback.",
    status: "aktiv",
    sistKjort: "Ved manuell trigger fra plan-wizard",
  },
};

const STATUS_VARIANT: Record<
  AgentKonfig["status"],
  "ok" | "lime" | "neutral"
> = {
  aktiv: "ok",
  beta: "lime",
  planlagt: "neutral",
};

const ACTION_LABEL: Record<string, string> = {
  PYRAMID_ADJUST: "Juster pyramide",
  SESSION_ADD: "Legg til økt",
  SESSION_REMOVE: "Fjern økt",
  INTENSITY_ADJUST: "Juster intensitet",
  TAPER_ENGAGE: "Start taper",
  WITHDRAW: "Trekk fra",
  DRILL_SUGGEST: "Drill-forslag",
  TEST_SCHEDULE: "Planlegg test",
  PEER_COMPARE: "Sammenlign",
  RECOVERY_ADD: "Legg til hvile",
  ESCALATION: "Eskalering",
  DELOAD: "Pauseuke",
};

export default async function AgentDetaljPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { agentId } = await params;
  const konfig = AGENT_KONFIG[agentId];
  if (!konfig) notFound();

  const [kjoringer, planActions] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        action: { startsWith: `agent.${agentId}` },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        actor: { select: { name: true } },
      },
    }),
    prisma.planAction.findMany({
      where: { agentName: agentId },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user: { select: { id: true, name: true } },
      },
    }),
  ]);

  return (
    <DetailShell
      breadcrumb={[
        { label: "Agenter", href: "/admin/agents" },
        { label: konfig.navn },
      ]}
      backHref="/admin/agents"
      title={konfig.navn}
      subtitle={konfig.beskrivelse}
      statusPill={
        <AthleticBadge variant={STATUS_VARIANT[konfig.status]}>
          {konfig.status}
        </AthleticBadge>
      }
      kpiRow={
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          <KPICard
            eyebrow="Status"
            value={konfig.status.toUpperCase()}
            variant="hero"
          />
          <KPICard eyebrow="Sist kjørt" value={konfig.sistKjort} />
          <KPICard
            eyebrow="Kjøringer i loggen"
            value={String(kjoringer.length)}
          />
        </div>
      }
    >
      {/* Siste 10 forslag (PlanAction) fra denne agenten */}
      <section>
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.8} />
            <h3 className="font-display text-lg font-semibold tracking-tight">
              Siste forslag fra agenten
            </h3>
          </div>
          <Link
            href="/admin/approvals"
            className="text-[12px] text-muted-foreground hover:text-foreground"
          >
            Se alle ventende →
          </Link>
        </div>
        {planActions.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            titleItalic="Ingen forslag"
            titleTrail="ennå"
            sub="Forslag fra denne agenten dukker opp her."
          />
        ) : (
          <div className="space-y-2">
            {planActions.map((a) => {
              const sugg = a.suggestion as { forklaring?: string } | null;
              const statusKlasse =
                a.status === "PENDING"
                  ? "bg-accent/30 text-accent-foreground"
                  : a.status === "ACCEPTED"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground";
              return (
                <article
                  key={a.id}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="rounded-sm bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                          {ACTION_LABEL[a.actionType] ?? a.actionType}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${statusKlasse}`}
                        >
                          {a.status === "PENDING"
                            ? "Venter"
                            : a.status === "ACCEPTED"
                              ? "Godkjent"
                              : "Avvist"}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {a.user.name}
                        </span>
                        <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                          {a.createdAt.toLocaleDateString("nb-NO", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                          })}
                        </span>
                      </div>
                      {sugg?.forklaring && (
                        <p className="text-sm text-foreground leading-relaxed">
                          {sugg.forklaring}
                        </p>
                      )}
                    </div>
                    {a.status === "PENDING" && (
                      <div className="shrink-0">
                        <ApprovalActions actionId={a.id} />
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Bot className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          <h3 className="font-display text-lg font-semibold tracking-tight">
            Siste kjøringer (audit-logg)
          </h3>
        </div>
        {kjoringer.length === 0 ? (
          <EmptyState
            icon={Bot}
            titleItalic="Ingen kjøringer"
            titleTrail="ennå"
            sub="Når agenten kjøres, dukker den opp her med feedback-mulighet."
          />
        ) : (
          <div className="space-y-4">
            {kjoringer.map((k) => {
              const meta = (k.metadata as Record<string, unknown> | null) ?? null;
              const snippet = lagSnippet(meta);
              return (
                <article
                  key={k.id}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                        {k.action}
                      </div>
                      <div className="mt-1 text-sm font-semibold">
                        {k.actor?.name ?? "System"}
                        {k.target ? (
                          <span className="ml-2 font-mono text-xs font-normal text-muted-foreground">
                            → {k.target}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="text-right font-mono text-[10px] tabular-nums text-muted-foreground">
                      {k.createdAt.toLocaleString("nb-NO", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  {snippet && (
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {snippet}
                    </p>
                  )}
                  <FeedbackForm auditId={k.id} />
                </article>
              );
            })}
          </div>
        )}
      </section>
    </DetailShell>
  );
}

function lagSnippet(meta: Record<string, unknown> | null): string | null {
  if (!meta) return null;
  const kandidater = [
    "suggestion",
    "result",
    "summary",
    "snippet",
    "brukerPrompt",
    "prompt",
    "feedback",
  ];
  for (const k of kandidater) {
    const v = meta[k];
    if (typeof v === "string" && v.trim().length > 0) {
      return v.slice(0, 240);
    }
  }
  const json = JSON.stringify(meta);
  return json.length > 4 ? json.slice(0, 240) : null;
}
