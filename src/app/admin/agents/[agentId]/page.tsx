// Detalj-side per agent. Viser konfigurasjon, siste kjøringer (fra
// AuditLog hvor action starter med `agent.<agentId>`) og lar coach
// gi tommel opp/ned-feedback per kjøring.

import { notFound } from "next/navigation";
import Link from "next/link";
import { Bot, ChevronLeft, Sparkles } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { FeedbackForm } from "./feedback-form";

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

const STATUS_FARGE: Record<AgentKonfig["status"], string> = {
  aktiv: "bg-primary/10 text-primary",
  beta: "bg-accent/30 text-accent-foreground",
  planlagt: "bg-secondary text-secondary-foreground",
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

  const kjoringer = await prisma.auditLog.findMany({
    where: {
      action: { startsWith: `agent.${agentId}` },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      actor: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-8">
      <Link
        href="/admin/agents"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
        Agenter
      </Link>

      <PageHeader
        eyebrow={`CoachHQ · Agent · ${agentId}`}
        titleLead={konfig.navn.split(" ")[0]}
        titleItalic={konfig.navn.split(" ").slice(1).join(" ") || "agent"}
        sub={konfig.beskrivelse}
      />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article className="rounded-lg border border-border bg-card p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Status
          </div>
          <div className="mt-2">
            <span
              className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.10em] ${
                STATUS_FARGE[konfig.status]
              }`}
            >
              {konfig.status}
            </span>
          </div>
        </article>
        <article className="rounded-lg border border-border bg-card p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Sist kjørt
          </div>
          <div className="mt-2 text-sm font-semibold">{konfig.sistKjort}</div>
        </article>
        <article className="rounded-lg border border-border bg-card p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Kjøringer i loggen
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold tabular-nums">
            {kjoringer.length}
          </div>
        </article>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" strokeWidth={1.8} />
          <h3 className="font-display text-lg font-semibold tracking-tight">
            Siste kjøringer
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
          <div className="space-y-3">
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
    </div>
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
