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

  const [openCount, aiRuns, recentTasks] = await Promise.all([
    prisma.kommandoTask.count({ where: { userId: user.id, status: "open" } }),
    prisma.kommandoMessage.count({ where: { userId: user.id, role: "assistant" } }),
    prisma.kommandoTask.findMany({
      where: { userId: user.id, status: "open" },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  return (
    <div className="space-y-5">
      <KpiStrip cols={4}>
        <KpiCard label="Modeller" value={KOMMANDO_MODELS.length} />
        <KpiCard label="Åpne oppgaver" value={openCount} />
        <KpiCard label="AI-kjøringer" value={aiRuns} />
        <KpiCard label="Prosjekter" value="—" />
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

        {/* I dag — kalender kommer i E2 */}
        <section className="rounded-xl border border-border bg-card p-4">
          <h2 className="mb-3 font-display text-[13px] font-semibold text-foreground">I dag</h2>
          <p className="py-6 text-center text-xs text-muted-foreground">
            Kalenderen kobles på i Etappe 2.
          </p>
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
