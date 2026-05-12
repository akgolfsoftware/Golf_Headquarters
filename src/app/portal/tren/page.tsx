/**
 * PlayerHQ · Trening — Plan/hub-side
 *
 * Endelig produksjonsdesign migrert fra playerhq-statistikk-demo-malen:
 * hero-eyebrow + italic-tittel, KPI-strip, aktiv plan-card, lister med
 * kommende og fullførte økter. Tomtilstander via <EmptyState/>.
 */

import Link from "next/link";
import {
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Dumbbell,
  Flame,
  MessageSquarePlus,
  Plus,
  Target,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import type { PyramidArea } from "@/generated/prisma/client";

const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "Fysisk",
  TEK: "Teknisk",
  SLAG: "Slag",
  SPILL: "Spill",
  TURN: "Turnering",
};

const PYR_BG: Record<PyramidArea, string> = {
  FYS: "bg-pyr-fys/15 text-pyr-fys",
  TEK: "bg-pyr-tek/15 text-pyr-tek",
  SLAG: "bg-pyr-slag/30 text-foreground",
  SPILL: "bg-pyr-spill/15 text-pyr-spill",
  TURN: "bg-pyr-turn/15 text-pyr-turn",
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function startOfIsoWeek(d: Date): Date {
  const x = startOfDay(d);
  const dag = x.getDay(); // 0 = søndag
  const offset = dag === 0 ? -6 : 1 - dag;
  x.setDate(x.getDate() + offset);
  return x;
}

function endOfIsoWeek(d: Date): Date {
  const start = startOfIsoWeek(d);
  const slutt = new Date(start);
  slutt.setDate(slutt.getDate() + 7);
  return slutt;
}

function sammeDag(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formaterDag(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function formaterTidspunkt(d: Date): string {
  return d.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formaterTall(n: number, desimaler = 1): string {
  return n.toFixed(desimaler).replace(".", ",");
}

export default async function TrenPlanPage() {
  const user = await requirePortalUser();
  const now = new Date();
  const ukestart = startOfIsoWeek(now);
  const ukeslutt = endOfIsoWeek(now);

  // Hent spillerens aktive plan og økter
  const aktivPlan = await prisma.trainingPlan.findFirst({
    where: { userId: user.id, isActive: true },
    orderBy: { startDate: "desc" },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      _count: { select: { sessions: true } },
    },
  });

  const aktivePlaner = await prisma.trainingPlan.findMany({
    where: { userId: user.id, isActive: true },
    select: { id: true },
  });
  const planIds = aktivePlaner.map((p) => p.id);

  const [ukeSessions, kommendeSessions, fullforte, sisteRunder] =
    await Promise.all([
      planIds.length
        ? prisma.trainingPlanSession.findMany({
            where: {
              planId: { in: planIds },
              scheduledAt: { gte: ukestart, lt: ukeslutt },
            },
            select: { id: true, durationMin: true, status: true },
          })
        : Promise.resolve([]),
      planIds.length
        ? prisma.trainingPlanSession.findMany({
            where: {
              planId: { in: planIds },
              scheduledAt: { gte: startOfDay(now) },
              status: { in: ["PLANNED", "ACTIVE"] },
            },
            orderBy: { scheduledAt: "asc" },
            take: 7,
            select: {
              id: true,
              title: true,
              scheduledAt: true,
              durationMin: true,
              pyramidArea: true,
              status: true,
              _count: { select: { drills: true } },
            },
          })
        : Promise.resolve([]),
      planIds.length
        ? prisma.trainingPlanSession.findMany({
            where: {
              planId: { in: planIds },
              status: "COMPLETED",
            },
            orderBy: { scheduledAt: "desc" },
            take: 5,
            select: {
              id: true,
              title: true,
              scheduledAt: true,
              durationMin: true,
              pyramidArea: true,
              log: { select: { rating: true, csAchieved: true } },
            },
          })
        : Promise.resolve([]),
      prisma.round.findMany({
        where: { userId: user.id },
        orderBy: { playedAt: "desc" },
        take: 10,
        select: { sgTotal: true, playedAt: true },
      }),
    ]);

  // KPI-beregninger
  const okterDenneUka = ukeSessions.length;
  const minutterDenneUka = ukeSessions.reduce(
    (sum, s) => sum + s.durationMin,
    0
  );
  const fullforteDenneUka = ukeSessions.filter(
    (s) => s.status === "COMPLETED"
  ).length;

  const sgVerdier = sisteRunder
    .map((r) => r.sgTotal)
    .filter((v): v is number => typeof v === "number");
  const snittSg =
    sgVerdier.length > 0
      ? sgVerdier.reduce((a, b) => a + b, 0) / sgVerdier.length
      : null;

  // Streak: antall sammenhengende dager bakover med minst én fullført økt
  // Vi henter siste 60 dager med fullførte økter for å holde queryen lett.
  const streakStart = new Date(now);
  streakStart.setDate(streakStart.getDate() - 60);
  const streakSessions = planIds.length
    ? await prisma.trainingPlanSession.findMany({
        where: {
          planId: { in: planIds },
          status: "COMPLETED",
          scheduledAt: { gte: streakStart },
        },
        select: { scheduledAt: true },
      })
    : [];
  const fullforteDager = new Set<string>(
    streakSessions.map((s) => startOfDay(s.scheduledAt).toISOString())
  );
  let streak = 0;
  const cursor = startOfDay(now);
  // Hvis ingen økt i dag, regn streak fra i går
  if (!fullforteDager.has(cursor.toISOString())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (fullforteDager.has(cursor.toISOString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const ingenPlanOgIngenOkter =
    !aktivPlan && kommendeSessions.length === 0 && fullforte.length === 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PlayerHQ · Trening"
        titleLead="Mine"
        titleItalic="økter"
        sub="Planlagte og fullførte treningsøkter, aktiv plan og ukens nøkkeltall."
        actions={
          <>
            <Link
              href="/portal/onskeligokt"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <MessageSquarePlus size={16} strokeWidth={1.5} />
              Be om økt fra coach
            </Link>
            <Link
              href="/portal/ny-okt"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus size={16} strokeWidth={1.75} />
              Start ny økt
            </Link>
          </>
        }
      />

      {ingenPlanOgIngenOkter ? (
        <EmptyState
          icon={Dumbbell}
          titleItalic="Ingen økter"
          titleTrail="ennå"
          sub="Du har ingen aktiv treningsplan eller registrerte økter. Start din første økt nå, eller be coach om en plan."
          cta={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/portal/ny-okt"
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                <Plus size={16} strokeWidth={1.75} />
                Start ny økt
              </Link>
              <Link
                href="/portal/onskeligokt"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-secondary"
              >
                <MessageSquarePlus size={16} strokeWidth={1.5} />
                Be om økt fra coach
              </Link>
            </div>
          }
        />
      ) : (
        <>
          {/* KPI-strip */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard
              label="Denne uka"
              value={String(okterDenneUka)}
              sub={
                okterDenneUka === 0
                  ? "Ingen økter planlagt"
                  : `${fullforteDenneUka} av ${okterDenneUka} fullført`
              }
              icon={Calendar}
            />
            <KpiCard
              label="Volum · uke"
              value={
                minutterDenneUka >= 60
                  ? `${Math.floor(minutterDenneUka / 60)} t ${minutterDenneUka % 60} m`
                  : `${minutterDenneUka} m`
              }
              sub="Planlagt treningstid"
              icon={Clock}
            />
            <KpiCard
              label="Snitt SG · 10"
              value={snittSg === null ? "—" : (snittSg >= 0 ? "+" : "") + formaterTall(snittSg, 2)}
              sub={
                snittSg === null
                  ? "Ingen runder registrert"
                  : `Strokes Gained · ${sgVerdier.length} runder`
              }
              icon={Target}
              accent={snittSg !== null && snittSg >= 0}
            />
            <KpiCard
              label="Streak"
              value={streak === 0 ? "0" : `${streak}`}
              sub={
                streak === 0
                  ? "Start en streak i dag"
                  : `dag${streak === 1 ? "" : "er"} på rad`
              }
              icon={Flame}
              accent={streak >= 3}
            />
          </section>

          {/* Aktiv plan */}
          {aktivPlan && (
            <section className="rounded-lg border border-border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    Aktiv plan
                  </span>
                  <h2 className="mt-1 font-display text-xl font-semibold leading-tight tracking-tight">
                    {aktivPlan.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formaterDag(aktivPlan.startDate)}
                    {aktivPlan.endDate
                      ? ` – ${formaterDag(aktivPlan.endDate)}`
                      : " · pågående"}
                    {" · "}
                    {aktivPlan._count.sessions} økt
                    {aktivPlan._count.sessions === 1 ? "" : "er"} totalt
                  </p>
                </div>
                <Link
                  href="/portal/tren/kalender"
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-transparent px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
                >
                  Se hele planen
                  <ChevronRight size={14} strokeWidth={1.5} />
                </Link>
              </div>
            </section>
          )}

          {/* Kommende økter */}
          <section className="space-y-3">
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Kommende økter
              </h2>
              <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                {kommendeSessions.length} planlagt
              </span>
            </div>

            {kommendeSessions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card/40 p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Ingen kommende økter planlagt.
                </p>
                <Link
                  href="/portal/ny-okt"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  <Plus size={14} strokeWidth={1.75} />
                  Start ny økt
                </Link>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {kommendeSessions.map((s) => {
                  const dato = new Date(s.scheduledAt);
                  const erIDag = sammeDag(dato, now);
                  return (
                    <li key={s.id}>
                      <Link
                        href={`/portal/tren/${s.id}`}
                        className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-secondary/50"
                      >
                        <div className="flex w-14 flex-col items-center rounded-md bg-secondary/60 px-2 py-2 text-center">
                          <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
                            {dato.toLocaleDateString("nb-NO", {
                              weekday: "short",
                            })}
                          </span>
                          <span
                            className={`mt-0.5 font-mono text-lg font-semibold ${
                              erIDag ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {dato.getDate()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                                PYR_BG[s.pyramidArea]
                              }`}
                            >
                              {PYR_LABEL[s.pyramidArea]}
                            </span>
                            <h3 className="truncate text-sm font-semibold text-foreground">
                              {s.title}
                            </h3>
                          </div>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {formaterTidspunkt(dato)} · {s.durationMin} min ·{" "}
                            {s._count.drills} drill
                            {s._count.drills === 1 ? "" : "s"}
                          </p>
                        </div>
                        <ChevronRight
                          size={18}
                          strokeWidth={1.5}
                          className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Siste fullførte */}
          {fullforte.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  Siste fullførte
                </h2>
                <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                  {fullforte.length} økt
                  {fullforte.length === 1 ? "" : "er"}
                </span>
              </div>

              <ul className="flex flex-col gap-2">
                {fullforte.map((s) => {
                  const dato = new Date(s.scheduledAt);
                  return (
                    <li key={s.id}>
                      <Link
                        href={`/portal/tren/${s.id}`}
                        className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-secondary/50"
                      >
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                          <CheckCircle2 size={18} strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                                PYR_BG[s.pyramidArea]
                              }`}
                            >
                              {PYR_LABEL[s.pyramidArea]}
                            </span>
                            <h3 className="truncate text-sm font-semibold text-foreground">
                              {s.title}
                            </h3>
                          </div>
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {formaterDag(dato)} · {s.durationMin} min
                            {s.log?.rating
                              ? ` · vurdering ${s.log.rating}/5`
                              : ""}
                            {typeof s.log?.csAchieved === "number"
                              ? ` · CS ${s.log.csAchieved}`
                              : ""}
                          </p>
                        </div>
                        <ChevronRight
                          size={18}
                          strokeWidth={1.5}
                          className="text-muted-foreground transition-transform group-hover:translate-x-0.5"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {/* Footer-status hvis ingen aktiv plan, men det finnes økter */}
          {!aktivPlan && (
            <div className="rounded-lg border border-dashed border-border bg-card/40 px-5 py-4 text-sm text-muted-foreground">
              Du har ingen aktiv treningsplan. Opprett en økt via{" "}
              <Link
                href="/portal/ny-okt"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                «Start ny økt»
              </Link>{" "}
              eller{" "}
              <Link
                href="/portal/onskeligokt"
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                be om økt fra coach
              </Link>
              .
            </div>
          )}
        </>
      )}

    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  sub: string;
  icon: typeof Calendar;
  accent?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          {label}
        </span>
        <Icon
          size={14}
          strokeWidth={1.5}
          className={accent ? "text-primary" : "text-muted-foreground"}
        />
      </div>
      <div
        className={`mt-2 font-display text-2xl font-semibold leading-none tracking-tight ${
          accent ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </div>
      <div className="mt-1.5 text-[12px] text-muted-foreground">{sub}</div>
    </div>
  );
}
