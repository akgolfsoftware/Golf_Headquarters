/**
 * PlayerHQ · Mål — Oversikt
 *
 * Migrert til produksjonsdesign med PageHeader (italic Instrument Serif),
 * semantiske tokens og 8pt-grid. EmptyState for tom mål-liste.
 */

import { Target } from "lucide-react";
import Link from "next/link";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { aggregateSg, formatSg } from "@/lib/sg";
import { SgSpider } from "@/components/portal/sg-spider";
import { GoalsCard } from "@/components/portal/goals-card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NyGoalModal } from "./ny-goal-modal";

export default async function MalOversikt() {
  const user = await requirePortalUser();

  const tretti = new Date();
  tretti.setDate(tretti.getDate() - 30);

  const [rounds, goals] = await Promise.all([
    prisma.round.findMany({
      where: { userId: user.id, playedAt: { gte: tretti } },
      orderBy: { playedAt: "desc" },
      include: { course: true },
    }),
    prisma.goal.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const sg = aggregateSg(rounds);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PlayerHQ · Mål"
        titleLead="Dine mål og"
        titleItalic="utvikling"
        sub="SG-fordeling siste 30 dager, nøkkeltall og dine aktive mål. Registrer flere runder for ferskere data."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-lg border border-border bg-card p-6 lg:col-span-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            SG-fordeling · siste 30 dager
          </span>
          <div className="mt-4">
            <SgSpider data={sg} />
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Skala: -2 til +2 SG. Stiplet linje = par (0).
          </p>
        </section>

        <section className="space-y-4 lg:col-span-2">
          <div className="grid grid-cols-2 gap-4">
            <Stat
              label="SG total"
              value={formatSg(sg.total)}
              hint={`${sg.rundeAntall} runder`}
            />
            <Stat
              label="Snitt-score"
              value={
                sg.snittScore != null
                  ? sg.snittScore.toFixed(1).replace(".", ",")
                  : "—"
              }
              hint="Siste 30 dager"
            />
            <Stat label="OTT" value={formatSg(sg.ott)} hint="Off the tee" />
            <Stat label="APP" value={formatSg(sg.app)} hint="Approach" />
            <Stat label="ARG" value={formatSg(sg.arg)} hint="Around the green" />
            <Stat label="PUTT" value={formatSg(sg.putt)} hint="Putting" />
          </div>

          {sg.rundeAntall === 0 && (
            <EmptyState
              icon={Target}
              titleItalic="Ingen runder"
              titleTrail="ennå"
              sub="Du har ikke registrert noen runder de siste 30 dagene. Registrer din første runde for å se SG-data."
              cta={
                <Link
                  href="/portal/mal/runder"
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
                >
                  Registrer runde
                </Link>
              }
            />
          )}

          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold tracking-tight">
              Mine mål
            </h3>
            <NyGoalModal />
          </div>
          <GoalsCard goals={goals} />
        </section>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-xl font-semibold tabular-nums text-foreground">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}
