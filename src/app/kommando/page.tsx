// TODO: MIGRERES til /admin/workspace, deretter slettes — se plans/opprydding-og-ferdigstilling.md
//
// AK Agency OS — Dashboard (/kommando). Kommandosenter: KPI-strip + paneler
// (AI-agenter, I dag, Oppgaver). Ekte tall fra DB; ingen dummy. Kalender og
// prosjekter er ærlige plassholdere til Etappe 2.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { prisma } from "@/lib/prisma";
import { KpiStrip, KpiCard, AthleticBadge } from "@/components/athletic";
import { cn } from "@/lib/utils";
import { KOMMANDO_MODELS } from "@/lib/kommando/models";
import { kommandoModelReady } from "@/lib/kommando/providers";

export default async function KommandoDashboard() {
  const user = await canAccessMissionControl();
  if (!user) return null; // layoutet redirecter; dette gir type-narrowing

  const now = new Date();
  const startIdag = new Date(now);
  startIdag.setHours(0, 0, 0, 0);
  const startImorgen = new Date(startIdag);
  startImorgen.setDate(startIdag.getDate() + 1);

  const [openCount, aiRuns, recentTasks, projectsCount, todayBookings, todayTasks, latestRun] = await Promise.all([
    prisma.kommandoTask.count({ where: { userId: user.id, status: "open" } }),
    prisma.kommandoMessage.count({ where: { userId: user.id, role: "assistant" } }),
    prisma.kommandoTask.findMany({
      where: { userId: user.id, status: "open" },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.kommandoProject.count({ where: { userId: user.id, status: "active" } }),
    prisma.booking.findMany({
      where: { startAt: { gte: startIdag, lt: startImorgen }, status: { in: ["CONFIRMED", "PENDING"] } },
      orderBy: { startAt: "asc" },
      include: { user: { select: { name: true } }, serviceType: { select: { name: true } } },
    }),
    prisma.kommandoTask.findMany({
      where: { userId: user.id, status: "open", dueAt: { gte: startIdag, lt: startImorgen } },
      orderBy: { dueAt: "asc" },
    }),
    prisma.kommandoAgentRun.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
  ]);

  const latestSteps = latestRun
    ? await prisma.kommandoAgentStep.findMany({
        where: { runId: latestRun.id },
        select: { status: true },
      })
    : [];
  const teamDone = latestSteps.filter((s) => s.status === "done" || s.status === "skipped").length;
  const teamPct = latestSteps.length ? Math.round((teamDone / latestSteps.length) * 100) : 0;
  const teamStatusLabel =
    latestRun?.status === "done" ? "Ferdig" : latestRun?.status === "failed" ? "Feilet" : "Kjører";
  const teamStatusVariant =
    latestRun?.status === "done" ? "ok" : latestRun?.status === "failed" ? "urgent" : "lime";

  return (
    <div className="space-y-5">
      <KpiStrip cols={4}>
        <KpiCard label="Modeller" value={KOMMANDO_MODELS.length} />
        <KpiCard label="Åpne oppgaver" value={openCount} />
        <KpiCard label="AI-kjøringer" value={aiRuns} />
        <KpiCard label="Prosjekter" value={projectsCount} />
      </KpiStrip>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* AI-agenter */}
        <section className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[13px] font-semibold text-foreground">AI-agenter</h2>
            <Link
              href="/kommando/agenter"
              className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-foreground"
            >
              Åpne chat <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </div>
          <ul className="space-y-2.5">
            {KOMMANDO_MODELS.map((m) => {
              const ready = kommandoModelReady(m.id);
              return (
                <li key={m.id} className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 flex-none rounded-full",
                      ready ? "bg-accent" : "bg-muted-foreground/40",
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-foreground">{m.label}</div>
                    <div className="text-[11px] text-muted-foreground">{m.role}</div>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                    {ready ? "Klar" : "Mangler nøkkel"}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* I dag — ekte bookinger + oppgavefrister */}
        <section className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[13px] font-semibold text-foreground">I dag</h2>
            <Link
              href="/kommando/kalender"
              className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-foreground"
            >
              Kalender <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </div>
          {todayBookings.length === 0 && todayTasks.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">
              Ingen avtaler eller frister i dag.
            </p>
          ) : (
            <ul className="space-y-2.5">
              {todayBookings.map((b) => {
                const navn = b.user?.name ?? b.guestName ?? "Gjest";
                const tid = b.startAt.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" });
                return (
                  <li key={b.id} className="flex items-center gap-3 text-sm">
                    <span className="w-10 flex-none font-mono text-[11px] text-accent">{tid}</span>
                    <span className="flex-1 truncate text-foreground">
                      {b.serviceType.name} — {navn}
                    </span>
                  </li>
                );
              })}
              {todayTasks.map((t) => (
                <li key={t.id} className="flex items-center gap-3 text-sm">
                  <span className="w-10 flex-none font-mono text-[10px] text-muted-foreground">FRIST</span>
                  <span className="flex-1 truncate text-foreground">{t.title}</span>
                  {t.priority === "haster" && <AthleticBadge variant="warn">Haster</AthleticBadge>}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Agent-team */}
        <section className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[13px] font-semibold text-foreground">Agent-team</h2>
            <Link
              href="/kommando/team"
              className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-foreground"
            >
              Åpne <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </div>
          {latestRun ? (
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="truncate text-sm text-foreground">{latestRun.title}</span>
                <AthleticBadge variant={teamStatusVariant}>{teamStatusLabel}</AthleticBadge>
              </div>
              <div className="h-1.5 overflow-hidden rounded bg-secondary">
                <div className="h-full bg-accent" style={{ width: `${teamPct}%` }} />
              </div>
              <div className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.05em] text-muted-foreground">
                {teamDone}/{latestSteps.length} steg
              </div>
            </div>
          ) : (
            <p className="py-4 text-center text-xs text-muted-foreground">
              Ingen kjøringer enda.{" "}
              <Link href="/kommando/team" className="text-accent hover:underline">
                Start et team →
              </Link>
            </p>
          )}
        </section>

        {/* Oppgaver */}
        <section className="rounded-xl border border-border bg-card p-4 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[13px] font-semibold text-foreground">Oppgaver</h2>
            <Link
              href="/kommando/oppgaver"
              className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-foreground"
            >
              Alle <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </div>
          {recentTasks.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">Ingen åpne oppgaver.</p>
          ) : (
            <ul className="space-y-1.5">
              {recentTasks.map((t) => (
                <li key={t.id} className="flex items-center gap-3 text-sm text-foreground">
                  <span className="h-1.5 w-1.5 flex-none rounded-full bg-muted-foreground/40" />
                  <span className="flex-1">{t.title}</span>
                  {t.priority === "haster" && <AthleticBadge variant="warn">Haster</AthleticBadge>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
