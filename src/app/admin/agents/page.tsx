import Link from "next/link";
import { Activity, Bot, ChevronRight } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { ManualTrigger } from "./manual-trigger";

const AGENT_INFO: Record<string, { navn: string; trigger: string; beskrivelse: string }> = {
  "round-agent": {
    navn: "Round Agent",
    trigger: "Etter ny runde",
    beskrivelse: "Beregner SG-snitt siste 30 dager og skriver til Signal.",
  },
  "test-agent": {
    navn: "Test Agent",
    trigger: "Etter ny test",
    beskrivelse: "Trend-analyse per test (siste vs snitt forrige 3).",
  },
  "trackman-agent": {
    navn: "TrackMan Agent",
    trigger: "Etter CSV-import",
    beskrivelse: "Per-kølle-statistikk fra rawJson.",
  },
  "plan-watcher": {
    navn: "Plan Watcher",
    trigger: "Cron mandag 06:00",
    beskrivelse: "Sjekker forrige uke, genererer PYRAMID_ADJUST-forslag ved avvik.",
  },
  periodiseringsagent: {
    navn: "Periodiseringsagent",
    trigger: "Ved ny TrainingPlan",
    beskrivelse: "Foreslår initial uke-allokering for nye planer.",
  },
  "achievement-agent": {
    navn: "Achievement Agent",
    trigger: "Etter round/test",
    beskrivelse: "Sjekker streak/SG/first-time-milepæler.",
  },
  "training-gap": {
    navn: "Training Gap",
    trigger: "Cron mandag 06:30",
    beskrivelse: "Finner svakeste SG-område og genererer TRAINING_GAP-forslag hvis det får < 20 % av treningstid.",
  },
  "turnering-agent": {
    navn: "Turnering-agent",
    trigger: "Cron daglig 07:00",
    beskrivelse: "Spillere med turnering innen 7 dager får PERIOD_SWITCH-forslag.",
  },
  "calendar-sync": {
    navn: "Calendar Sync",
    trigger: "Cron hvert 15. min",
    beskrivelse: "2-veis synkronisering med Google Calendar: henter endringer (pull) og pusher bookinger uten event-ID (repair).",
  },
  "daily-brief": {
    navn: "Daily Brief",
    trigger: "Cron daglig 05:30",
    beskrivelse: "Genererer morgenbrief per coach (økter, flagg, neste turnering). Varsler coach + Anders på Telegram ved hastefunn (severity 4+).",
  },
  "drill-forslag": {
    navn: "Drill-forslag",
    trigger: "Cron mandag 08:00",
    beskrivelse: "Finner stallens svakeste SG-område siste 60 dager og foreslår 5 driller via Claude (med YouTube-video når YOUTUBE_API_KEY er satt). Godkjennes på /admin/drills/forslag.",
  },
  "plan-revisjon": {
    navn: "Plan-revisjon",
    trigger: "Manuell (velg plan)",
    beskrivelse: "Foreslår konkrete plan-justeringer for en valgt treningsplan og trigger (siste runde / skade / turneringsprep). Kjøres fra agent-detaljene.",
  },
  peaking: {
    navn: "Peaking",
    trigger: "Manuell (velg spiller)",
    beskrivelse: "Foreslår uke-for-uke periodisering (Bompa) frem mot en valgt turnering for en spiller. Kjøres fra agent-detaljene.",
  },
};

export default async function AgentsAdmin() {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  const idag = new Date();
  idag.setHours(0, 0, 0, 0);

  const [signalsCount, planActionsCount, recentRuns, pendingCount, forslagIdag] =
    await Promise.all([
      prisma.signal.count(),
      prisma.planAction.count(),
      prisma.agentRun.findMany({
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      prisma.planAction.count({ where: { status: "PENDING" } }),
      prisma.planAction.count({ where: { createdAt: { gte: idag } } }),
    ]);

  const aktiveAgenter = Object.keys(AGENT_INFO).length;

  // Aggreger per agent
  const perAgent = new Map<string, { ok: number; error: number; totalDuration: number }>();
  for (const r of recentRuns) {
    const eks = perAgent.get(r.agentName) ?? { ok: 0, error: 0, totalDuration: 0 };
    if (r.status === "OK") eks.ok++;
    else eks.error++;
    eks.totalDuration += r.duration;
    perAgent.set(r.agentName, eks);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="AgencyOS · Agenter"
        titleLead="Agent"
        titleItalic="pipeline"
        sub={`${signalsCount} signaler · ${planActionsCount} plan-actions totalt.`}
      />

      {/* Stat-grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatKort label="Aktive agenter" value={String(aktiveAgenter)} />
        <StatKort label="Forslag i dag" value={String(forslagIdag)} />
        <StatKort
          label="Venter på godkjenning"
          value={String(pendingCount)}
          highlight={pendingCount > 0}
          link="/admin/godkjenninger"
          linkLabel="Se alle"
        />
      </div>

      {/* Agent-tabell */}
      <section>
        <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
          Registrerte agenter
        </h2>
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-border bg-secondary/40 text-left">
                <tr>
                  <Th>Navn</Th>
                  <Th>Type / trigger</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Kjøringer</Th>
                  <Th className="text-right">Snitt-tid</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {Object.entries(AGENT_INFO).map(([slug, info]) => {
                  const stats = perAgent.get(slug);
                  const harFeil = stats && stats.error > 0;
                  const status = !stats ? "Ingen data" : harFeil ? "Feil" : "Aktiv";
                  const statusKlasse = !stats
                    ? "bg-secondary text-muted-foreground"
                    : harFeil
                      ? "bg-destructive/15 text-destructive"
                      : "bg-primary/10 text-primary";
                  return (
                    <tr key={slug} className="border-b border-border/60 last:border-0 hover:bg-secondary/30">
                      <Td>
                        <div className="flex items-center gap-2">
                          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-secondary text-primary">
                            <Bot size={16} strokeWidth={1.5} />
                          </span>
                          <span className="font-medium text-foreground">{info.navn}</span>
                        </div>
                      </Td>
                      <Td>
                        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                          {info.trigger}
                        </span>
                      </Td>
                      <Td>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${statusKlasse}`}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                          {status}
                        </span>
                      </Td>
                      <Td className="text-right font-mono text-[10px] tabular-nums text-muted-foreground">
                        {stats ? stats.ok + stats.error : "—"}
                      </Td>
                      <Td className="text-right font-mono text-[10px] tabular-nums text-muted-foreground">
                        {stats
                          ? `${Math.round(stats.totalDuration / Math.max(stats.ok + stats.error, 1))} ms`
                          : "—"}
                      </Td>
                      <Td>
                        <Link
                          href={`/admin/agents/${slug}`}
                          className="inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground"
                        >
                          Detaljer
                          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.8} />
                        </Link>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {user.role === "ADMIN" && <ManualTrigger />}

      <section>
        <h3 className="mb-4 font-display text-lg font-semibold tracking-tight">
          Siste 30 kjøringer
        </h3>
        {recentRuns.length === 0 ? (
          <EmptyState
            icon={Activity}
            titleItalic="Ingen kjøringer"
            titleTrail="ennå"
            sub="Agentene kjøres automatisk ved nye signaler. Trigger manuelt over for å teste."
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead className="border-b border-border bg-secondary/40 text-left">
                  <tr>
                    <Th>Agent</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Tid</Th>
                    <Th className="text-right">Når</Th>
                  </tr>
                </thead>
                <tbody>
                  {recentRuns.map((r) => (
                    <tr key={r.id} className="border-b border-border/60 last:border-0">
                      <Td>{r.agentName}</Td>
                      <Td>
                        <span
                          className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                            r.status === "OK"
                              ? "bg-primary/10 text-primary"
                              : "bg-destructive/15 text-destructive"
                          }`}
                        >
                          {r.status}
                        </span>
                      </Td>
                      <Td className="text-right font-mono text-[10px] tabular-nums">
                        {r.duration} ms
                      </Td>
                      <Td className="text-right font-mono text-[10px] text-muted-foreground">
                        {r.createdAt.toLocaleString("nb-NO", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

// ---------- sub-komponenter ----------

function StatKort({
  label,
  value,
  highlight = false,
  link,
  linkLabel,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  link?: string;
  linkLabel?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border p-6 ${
        highlight
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-card"
      }`}
    >
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`font-mono text-[32px] font-semibold leading-none tabular-nums ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </div>
      {link && linkLabel && (
        <Link
          href={link}
          className="mt-1 inline-flex items-center gap-1 text-[12px] text-muted-foreground hover:text-foreground"
        >
          {linkLabel}
          <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.8} />
        </Link>
      )}
    </div>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-4 ${className}`}>{children}</td>;
}
