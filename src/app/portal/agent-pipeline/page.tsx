import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export default async function AgentPipelinePage() {
  const user = await requirePortalUser();

  const [signals, planActions, runs] = await Promise.all([
    prisma.signal.findMany({
      where: { userId: user.id },
      orderBy: { computedAt: "desc" },
      take: 30,
    }),
    prisma.planAction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    user.role === "ADMIN"
      ? prisma.agentRun.findMany({
          orderBy: { createdAt: "desc" },
          take: 20,
        })
      : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-8">
      <Link
        href="/portal"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Hjem
      </Link>

      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Agent-pipeline
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Hva</em> agentene ser
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Innsikt i hvordan AK Golf-agentene tolker dataene dine. Signaler er
          aggregater (SG, pyramide, streak). Plan-actions er konkrete forslag
          du kan godkjenne eller avvise.
        </p>
      </header>

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold tracking-tight">
          Signaler (siste 30)
        </h2>
        {signals.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Ingen signaler ennå. Registrer en runde eller test så agentene har
            data å jobbe med.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left">
                <tr>
                  <Th>Type</Th>
                  <Th className="text-right">Verdi</Th>
                  <Th className="text-right">Beregnet</Th>
                </tr>
              </thead>
              <tbody>
                {signals.map((s) => (
                  <tr key={s.id} className="border-b border-border/60 last:border-0">
                    <Td>
                      <span className="rounded-sm bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                        {s.kind}
                      </span>
                    </Td>
                    <Td className="text-right tabular-nums">
                      {s.value != null ? s.value.toFixed(2).replace(".", ",") : "—"}
                    </Td>
                    <Td className="text-right font-mono text-[10px] text-muted-foreground">
                      {s.computedAt.toLocaleString("nb-NO", {
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

      <section>
        <h2 className="mb-3 font-display text-lg font-semibold tracking-tight">
          Plan-actions
        </h2>
        {planActions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Ingen forslag fra agentene ennå. Kommer typisk etter mandag-cron.
          </p>
        ) : (
          <ul className="space-y-2">
            {planActions.map((a) => {
              const sugg = a.suggestion as { forklaring?: string } | null;
              return (
                <li
                  key={a.id}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-primary">
                      {a.actionType}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                        a.status === "PENDING"
                          ? "bg-accent/30 text-foreground"
                          : a.status === "ACCEPTED"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {a.status}
                    </span>
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                      {a.agentName}
                    </span>
                  </div>
                  {sugg?.forklaring && (
                    <p className="mt-2 text-sm text-foreground">{sugg.forklaring}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {user.role === "ADMIN" && runs.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg font-semibold tracking-tight">
            Siste agent-kjøringer (admin)
          </h2>
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40 text-left">
                <tr>
                  <Th>Agent</Th>
                  <Th>Status</Th>
                  <Th className="text-right">Tid</Th>
                  <Th className="text-right">Når</Th>
                </tr>
              </thead>
              <tbody>
                {runs.map((r) => (
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
                    <Td className="text-right font-mono text-[10px] text-muted-foreground">
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
        </section>
      )}
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
