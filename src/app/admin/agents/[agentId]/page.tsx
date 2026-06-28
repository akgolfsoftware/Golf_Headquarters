// Detalj-side per agent. Viser konfigurasjon, siste kjøringer (fra
// AgentRun) og lar coach gi tommel opp/ned-feedback per kjøring.

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
  trigger: string;
};

const AGENT_KONFIG: Record<string, AgentKonfig> = {
  "round-agent": {
    navn: "Round Agent",
    beskrivelse:
      "Beregner SG-snitt siste 30 dager og skriver SG_TOTAL/OTT/APP/ARG/PUTT til Signal-tabellen etter at spiller logger en ny runde.",
    status: "aktiv",
    trigger: "Etter ny runde (event)",
  },
  "test-agent": {
    navn: "Test Agent",
    beskrivelse:
      "Sammenligner siste testresultat mot snitt av forrige 3 og skriver TEST_TREND-signal. Krever minst 1 tidligere resultat.",
    status: "aktiv",
    trigger: "Etter ny test (event)",
  },
  "trackman-agent": {
    navn: "TrackMan Agent",
    beskrivelse:
      "Grupperer slag per kølle fra rawJson etter CSV-import og skriver CLUB_AVG-signal per kølle.",
    status: "aktiv",
    trigger: "Etter CSV-import (event)",
  },
  "plan-watcher": {
    navn: "Plan Watcher",
    beskrivelse:
      "Sjekker forrige ukes pyramide-fordeling mot måltall (FYS15/TEK20/SLAG35/SPILL20/TURN10). Genererer PYRAMID_ADJUST-forslag ved >8 pp avvik.",
    status: "aktiv",
    trigger: "Cron mandag 06:00",
  },
  periodiseringsagent: {
    navn: "Periodiseringsagent",
    beskrivelse:
      "Foreslår initial uke-allokering for nye treningsplaner basert på MAL_PROSENT-fordeling. Kjører kun for planer uten eksisterende økter.",
    status: "aktiv",
    trigger: "Ved ny TrainingPlan (event)",
  },
  "achievement-agent": {
    navn: "Achievement Agent",
    beskrivelse:
      "Sjekker milepæler (FIRST_ROUND, FIRST_TEST, SG_POSITIVE_30D, STREAK_7/14) etter runde eller test. Dedup mot eksisterende achievements.",
    status: "aktiv",
    trigger: "Etter runde/test (event)",
  },
  "training-gap": {
    navn: "Training Gap",
    beskrivelse:
      "Finner svakeste SG-område og sjekker om spillere trener nok der. Genererer TRAINING_GAP-forslag hvis svakeste område får < 20 % av treningstid.",
    status: "aktiv",
    trigger: "Cron mandag 06:30",
  },
  "calendar-sync": {
    navn: "Calendar Sync",
    beskrivelse:
      "2-veis synkronisering med Google Calendar hvert 15. minutt. Pull: henter events oppdatert siden siste sync og reflekterer kansellering/tidsendring tilbake til Booking-tabellen. Push: reparerer bookinger som mangler googleEventId (missede push-forsøk).",
    status: "aktiv",
    trigger: "Cron hvert 15. min",
  },
  "daily-brief": {
    navn: "Daily Brief",
    beskrivelse:
      "Genererer morgenbrief per coach (dagens økter, flagg, neste turnering) og varsler coach + Anders på Telegram ved hastefunn (severity 4+).",
    status: "aktiv",
    trigger: "Cron daglig 05:30",
  },
  "drill-forslag": {
    navn: "Drill-forslag",
    beskrivelse:
      "Finner stallens svakeste SG-område siste 60 dager og foreslår 5 driller via Claude (YouTube-video når YOUTUBE_API_KEY er satt). Godkjennes på /admin/drills/forslag.",
    status: "aktiv",
    trigger: "Cron mandag 08:00",
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
  TRAINING_GAP: "Treningsgap",
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
    prisma.agentRun.findMany({
      where: { agentName: agentId },
      orderBy: { createdAt: "desc" },
      take: 20,
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

  const sistKjort = kjoringer[0]?.createdAt
    ? kjoringer[0].createdAt.toLocaleString("nb-NO", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Ikke kjørt";

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
            eyebrow="Trigger"
            value={konfig.trigger}
            variant="hero"
          />
          <KPICard eyebrow="Sist kjørt" value={sistKjort} />
          <KPICard
            eyebrow="Kjøringer"
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
            href="/admin/godkjenninger"
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
                        <ApprovalActions actionId={a.id} playerId={a.user.id} />
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
          <div className="space-y-4">
            {kjoringer.map((k) => {
              const output = (k.output as Record<string, unknown> | null) ?? null;
              const snippet = lagSnippet(output);
              const erFeil = k.status === "ERROR";
              return (
                <article
                  key={k.id}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono text-[10px] uppercase tracking-[0.10em] ${
                            erFeil ? "text-destructive" : "text-primary"
                          }`}
                        >
                          {erFeil ? "FEIL" : "OK"}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {k.duration} ms
                        </span>
                      </div>
                      {erFeil && k.error && (
                        <p className="mt-1 text-xs text-destructive">{k.error}</p>
                      )}
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
                  {!erFeil && snippet && (
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

  // Daily Brief: vis antall briefer/varsler + start på første brief.
  if (Array.isArray(meta.briefs)) {
    const n = meta.briefs.length;
    const varsler = typeof meta.varsler === "number" ? meta.varsler : 0;
    const first = meta.briefs[0] as { brief?: string } | undefined;
    const preview =
      typeof first?.brief === "string"
        ? ` — ${first.brief.replace(/\s+/g, " ").slice(0, 180)}`
        : "";
    return `${n} brief${n === 1 ? "" : "er"} · ${varsler} varsel${
      varsler === 1 ? "" : "er"
    }${preview}`;
  }

  // Drill-forslag: vis svakeste område + antall driller (og video-andel).
  if (typeof meta.svakesteLabel === "string" && Array.isArray(meta.driller)) {
    const n = meta.driller.length;
    const video =
      typeof meta.medVideo === "number" && meta.medVideo > 0
        ? `, ${meta.medVideo} m/video`
        : "";
    return `Svakest: ${meta.svakesteLabel} · ${n} drill${
      n === 1 ? "" : "er"
    }${video}`;
  }

  // Agenter som returnerer en ren statusmelding (f.eks. "ingen-sg-data").
  if (typeof meta.melding === "string" && meta.melding.trim().length > 0) {
    return meta.melding.slice(0, 240);
  }

  const kandidater = [
    "suggestion",
    "result",
    "summary",
    "snippet",
    "signalsWritten",
    "planActionsWritten",
    "brukerPrompt",
    "prompt",
    "feedback",
  ];
  for (const k of kandidater) {
    const v = meta[k];
    if (typeof v === "string" && v.trim().length > 0) {
      return v.slice(0, 240);
    }
    if (typeof v === "number") {
      return `${k}: ${v}`;
    }
  }
  const json = JSON.stringify(meta);
  return json.length > 4 ? json.slice(0, 240) : null;
}
