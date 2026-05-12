import { Activity, Bot } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
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
  "periodiseringsagent": {
    navn: "Periodiseringsagent",
    trigger: "Ved ny TrainingPlan",
    beskrivelse: "Foreslår initial uke-allokering for nye planer.",
  },
  "achievement-agent": {
    navn: "Achievement Agent",
    trigger: "Etter round/test",
    beskrivelse: "Sjekker streak/SG/first-time-milepæler.",
  },
};

export default async function AgentsAdmin() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [signalsCount, planActionsCount, recentRuns] = await Promise.all([
    prisma.signal.count(),
    prisma.planAction.count(),
    prisma.agentRun.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  // Aggreger per agent
  const perAgent = new Map<string, { ok: number; error: number; totalDuration: number }>();
  for (const r of recentRuns) {
    const eks = perAgent.get(r.agentName) ?? {
      ok: 0,
      error: 0,
      totalDuration: 0,
    };
    if (r.status === "OK") eks.ok++;
    else eks.error++;
    eks.totalDuration += r.duration;
    perAgent.set(r.agentName, eks);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Agenter"
        titleLead="Agent"
        titleItalic="pipeline"
        sub={`${signalsCount} signaler · ${planActionsCount} plan-actions totalt.`}
      />

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Object.entries(AGENT_INFO).map(([slug, info]) => {
          const stats = perAgent.get(slug);
          return (
            <article
              key={slug}
              className="rounded-lg border border-border bg-card p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-secondary text-primary">
                    <Bot size={20} strokeWidth={1.5} />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-semibold text-foreground">
                      {info.navn}
                    </h3>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      {info.trigger}
                    </p>
                  </div>
                </div>
                {stats && (
                  <div className="text-right font-mono text-[10px] uppercase tracking-[0.10em]">
                    <span className="text-primary">{stats.ok} OK</span>
                    {stats.error > 0 && (
                      <span className="ml-2 text-destructive">{stats.error} feil</span>
                    )}
                  </div>
                )}
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{info.beskrivelse}</p>
              {stats && (
                <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                  Snitt-tid: {Math.round(stats.totalDuration / Math.max(stats.ok + stats.error, 1))} ms
                </p>
              )}
            </article>
          );
        })}
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
            <table className="w-full text-sm">
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
                  <tr
                    key={r.id}
                    className="border-b border-border/60 last:border-0"
                  >
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
        )}
      </section>
    </div>
  );
}

function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <th
      className={`px-4 py-3 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
