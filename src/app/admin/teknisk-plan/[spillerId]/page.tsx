/**
 * /admin/teknisk-plan/[spillerId] — Teknisk plan for én spiller
 *
 * Viser spillerens tekniske mål periodisert etter fase (L-fase),
 * og fremgangsmålinger per teknisk element (TEK-økter).
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ClipboardList, Target } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/shared/empty-state";

const NB_SHORT = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "short",
});

const LFASE_LABELS: Record<string, string> = {
  GRUNN: "Grunnfase",
  SPESIAL: "Spesialfase",
  TURNERING: "Turneringsfase",
};

function formatHcp(v: number | null | undefined): string {
  if (v == null) return "—";
  const sign = v >= 0 ? "+" : "−";
  return `${sign}${Math.abs(v).toFixed(1).replace(".", ",")}`;
}

export default async function TekniskPlanSpiller({
  params,
}: {
  params: Promise<{ spillerId: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { spillerId } = await params;

  const spiller = await prisma.user.findUnique({
    where: { id: spillerId },
    include: {
      trainingPlans: {
        where: { isActive: true },
        include: {
          sessions: {
            where: { pyramidArea: "TEK" },
            include: {
              drills: {
                include: {
                  exercise: {
                    select: { name: true, description: true, pyramidArea: true, lPhase: true },
                  },
                },
                orderBy: { orderIndex: "asc" },
              },
              log: {
                select: {
                  csAchieved: true,
                  rating: true,
                  startedAt: true,
                  completedAt: true,
                  coachFeedback: true,
                },
              },
            },
            orderBy: { scheduledAt: "asc" },
          },
        },
        orderBy: { startDate: "desc" },
      },
    },
  });

  if (!spiller || spiller.role !== "PLAYER") notFound();

  // Alle TEK-økter på tvers av planer
  const allTekSessions = spiller.trainingPlans.flatMap((p) =>
    p.sessions.map((s) => ({
      ...s,
      planName: p.name,
      planId: p.id,
    }))
  );

  // Grupper per L-fase
  type FaseGroup = {
    fase: string;
    label: string;
    sessions: typeof allTekSessions;
  };
  const faseMap = new Map<string, typeof allTekSessions>();
  for (const s of allTekSessions) {
    const key = s.lPhase ?? "UTEN_FASE";
    const existing = faseMap.get(key) ?? [];
    existing.push(s);
    faseMap.set(key, existing);
  }

  const faseGrupper: FaseGroup[] = Array.from(faseMap.entries()).map(
    ([fase, sessions]) => ({
      fase,
      label: LFASE_LABELS[fase] ?? "Uten fase",
      sessions,
    })
  );

  // Fremdrift per øvelse (aggregert)
  type DrillAgg = {
    name: string;
    lPhase: string | null;
    antall: number;
    snittCs: number | null;
  };
  const drillMap = new Map<string, { count: number; csSum: number; csCount: number; lPhase: string | null }>();
  for (const s of allTekSessions) {
    for (const d of s.drills) {
      const key = d.exercise.name;
      const existing = drillMap.get(key) ?? { count: 0, csSum: 0, csCount: 0, lPhase: d.exercise.lPhase ?? null };
      existing.count += 1;
      if (s.log?.csAchieved != null) {
        existing.csSum += s.log.csAchieved;
        existing.csCount += 1;
      }
      drillMap.set(key, existing);
    }
  }
  const drillAgg: DrillAgg[] = Array.from(drillMap.entries()).map(
    ([name, data]) => ({
      name,
      lPhase: data.lPhase,
      antall: data.count,
      snittCs: data.csCount > 0 ? Math.round(data.csSum / data.csCount) : null,
    })
  );

  const harData = allTekSessions.length > 0;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/teknisk-plan"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
        Teknisk Plan oversikt
      </Link>

      {/* Hero */}
      <header className="flex items-start justify-between gap-6 border-b border-border pb-6">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Teknisk Plan · spiller
          </span>
          <h1 className="mt-1 font-display text-[28px] font-bold italic leading-[1.1] tracking-tight">
            <em className="font-medium italic">{spiller.name.split(" ")[0]}</em>
            {spiller.name.split(" ").length > 1 && (
              <> {spiller.name.split(" ").slice(1).join(" ")}</>
            )}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
            <span>HCP {formatHcp(spiller.hcp)}</span>
            {spiller.homeClub && (
              <>
                <span className="text-border">·</span>
                <span>{spiller.homeClub}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              TEK-økter
            </div>
            <div className="mt-1.5 font-mono text-[22px] font-semibold leading-none tabular-nums">
              {allTekSessions.length}
            </div>
          </div>
          <div>
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Fullført
            </div>
            <div className="mt-1.5 font-mono text-[22px] font-semibold leading-none tabular-nums text-primary">
              {allTekSessions.filter((s) => s.status === "COMPLETED").length}
            </div>
          </div>
          <div>
            <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Øvelser
            </div>
            <div className="mt-1.5 font-mono text-[22px] font-semibold leading-none tabular-nums">
              {drillAgg.length}
            </div>
          </div>
        </div>
      </header>

      {!harData ? (
        <EmptyState
          icon={ClipboardList}
          titleItalic="Ingen teknisk plan"
          titleTrail="for denne spilleren ennå"
          sub="Opprett en plan med TEK-økter fra Plan-oversikten for å bygge teknisk progresjon."
          cta={
            <Link
              href={`/admin/plans/new?player=${spiller.id}`}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Opprett plan
            </Link>
          }
        />
      ) : (
        <>
          {/* Fremdgling per øvelse */}
          <section className="rounded-lg border border-border bg-card p-6">
            <h2 className="mb-4 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Fremdgang per teknisk element · {drillAgg.length} øvelser
            </h2>
            <ul className="divide-y divide-border">
              {drillAgg.map((d) => (
                <li
                  key={d.name}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-6 py-4"
                >
                  <div>
                    <div className="text-[13px] font-semibold text-foreground">
                      {d.name}
                    </div>
                    {d.lPhase && (
                      <div className="mt-0.5 font-mono text-[10px] uppercase text-muted-foreground">
                        {LFASE_LABELS[d.lPhase] ?? d.lPhase}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-[13px] tabular-nums text-foreground">
                      {d.antall}×
                    </div>
                    <div className="font-mono text-[10px] text-muted-foreground">
                      gjentatt
                    </div>
                  </div>
                  <div className="text-right">
                    {d.snittCs != null ? (
                      <>
                        <div
                          className={`font-mono text-[16px] font-semibold tabular-nums ${
                            d.snittCs >= 75 ? "text-primary" : "text-foreground"
                          }`}
                        >
                          {d.snittCs}%
                        </div>
                        <div className="font-mono text-[10px] text-muted-foreground">
                          snitt CS
                        </div>
                      </>
                    ) : (
                      <div className="font-mono text-[12px] text-muted-foreground">
                        —
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Periodisert per fase */}
          {faseGrupper.map((fg) => (
            <section
              key={fg.fase}
              className="rounded-lg border border-border bg-card"
            >
              <div className="border-b border-border bg-secondary/40 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                    {fg.label} · {fg.sessions.length} TEK-økter
                  </h2>
                  <span className="font-mono text-[10px] text-muted-foreground">
                    {fg.sessions.filter((s) => s.status === "COMPLETED").length}/
                    {fg.sessions.length} fullført
                  </span>
                </div>
              </div>
              <ul className="divide-y divide-border">
                {fg.sessions.map((s) => {
                  const varighet =
                    s.log?.completedAt && s.log?.startedAt
                      ? Math.max(
                          1,
                          Math.round(
                            (s.log.completedAt.getTime() -
                              s.log.startedAt.getTime()) /
                              60000
                          )
                        )
                      : null;
                  return (
                    <li
                      key={s.id}
                      className="grid grid-cols-[72px_1fr_auto_auto] items-center gap-4 px-6 py-4"
                    >
                      <div>
                        <div className="font-mono text-[12px] font-semibold tabular-nums">
                          {NB_SHORT.format(s.scheduledAt)}
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                          {varighet != null ? `${varighet} min` : `${s.durationMin} min`}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-[13px] font-medium text-foreground">
                          {s.title}
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                          {s.drills.length} øvelser · {s.planName}
                        </div>
                      </div>
                      {s.log?.csAchieved != null ? (
                        <div className="text-right">
                          <div
                            className={`font-mono text-[16px] font-semibold tabular-nums ${
                              s.log.csAchieved >= 75 ? "text-primary" : "text-foreground"
                            }`}
                          >
                            {s.log.csAchieved}%
                          </div>
                          <div className="font-mono text-[10px] text-muted-foreground">
                            CS
                          </div>
                        </div>
                      ) : (
                        <div className="font-mono text-[12px] text-muted-foreground">
                          —
                        </div>
                      )}
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium ${
                          s.status === "COMPLETED"
                            ? "bg-primary/10 text-primary"
                            : s.status === "ACTIVE"
                              ? "bg-accent text-accent-foreground"
                              : "bg-secondary text-muted-foreground"
                        }`}
                      >
                        {s.status}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          {/* Lenke til spillerprofil */}
          <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
            <Target size={18} strokeWidth={1.5} className="shrink-0 text-muted-foreground" />
            <p className="flex-1 text-[13px] text-muted-foreground">
              Se full 360-profil for treningshistorikk, runder og TrackMan-data.
            </p>
            <Link
              href={`/admin/elever/${spiller.id}?tab=plan`}
              className="shrink-0 rounded-md border border-border bg-transparent px-4 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Åpne 360-profil
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
