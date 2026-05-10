import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { aggregateSg, formatSg } from "@/lib/sg";
import { SgSpider } from "@/components/portal/sg-spider";

export default async function Profil360({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const player = await prisma.user.findUnique({
    where: { id },
    include: {
      trainingPlans: {
        where: { isActive: true },
        include: {
          sessions: { select: { id: true, status: true } },
        },
      },
      rounds: {
        orderBy: { playedAt: "desc" },
        include: { course: true },
        take: 10,
      },
      testResults: {
        orderBy: { takenAt: "desc" },
        include: { test: true },
        take: 10,
      },
      trackManSessions: {
        orderBy: { recordedAt: "desc" },
        take: 5,
      },
    },
  });
  if (!player || player.role !== "PLAYER") notFound();

  const sg = aggregateSg(player.rounds);
  const initial = player.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="space-y-6">
      <Link
        href="/admin/elever"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Alle elever
      </Link>

      <header className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:items-start">
        <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            360-profil
          </span>
          <h1 className="mt-1 font-display text-3xl font-semibold leading-tight tracking-tight">
            {player.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{player.email}</p>
          <div className="mt-3 flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-[0.10em] text-foreground/70">
            {player.hcp != null && (
              <span>HCP {player.hcp.toFixed(1).replace(".", ",")}</span>
            )}
            {player.homeClub && <span>{player.homeClub}</span>}
            <span>{player.tier}</span>
            {player.playingYears && <span>{player.playingYears} år</span>}
          </div>
          {player.ambition && (
            <p className="mt-3 max-w-2xl text-sm text-foreground">
              {player.ambition}
            </p>
          )}
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-1">
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            SG-fordeling · siste runder
          </span>
          <div className="mt-3">
            <SgSpider data={sg} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:col-span-2">
          <Stat label="SG total" value={formatSg(sg.total)} sub={`${sg.rundeAntall} runder`} />
          <Stat
            label="Snitt-score"
            value={
              sg.snittScore != null ? sg.snittScore.toFixed(1).replace(".", ",") : "—"
            }
            sub="Siste 10 runder"
          />
          <Stat label="Aktive planer" value={String(player.trainingPlans.length)} />
          <Stat label="Tester" value={String(player.testResults.length)} sub="Siste 10" />
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-semibold tracking-tight">
          Aktive treningsplaner
        </h3>
        {player.trainingPlans.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Ingen aktive planer.
          </p>
        ) : (
          <ul className="space-y-2">
            {player.trainingPlans.map((p) => {
              const fullført = p.sessions.filter((s) => s.status === "COMPLETED")
                .length;
              return (
                <li
                  key={p.id}
                  className="flex items-center justify-between rounded-md border border-border bg-card px-4 py-3"
                >
                  <Link
                    href={`/admin/plans/${p.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {p.name}
                  </Link>
                  <span className="font-mono text-xs text-muted-foreground">
                    {fullført} / {p.sessions.length} økter
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 font-display text-lg font-semibold tracking-tight">
            Siste runder
          </h3>
          {player.rounds.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Ingen registrerte runder.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
              {player.rounds.slice(0, 5).map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <div>
                    <span className="font-medium">{r.course.name}</span>
                    <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                      {r.playedAt.toLocaleDateString("nb-NO", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  </div>
                  <span className="tabular-nums">
                    {r.score} · {formatSg(r.sgTotal)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="mb-3 font-display text-lg font-semibold tracking-tight">
            Siste tester
          </h3>
          {player.testResults.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              Ingen testresultater.
            </p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
              {player.testResults.slice(0, 5).map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between px-4 py-2.5 text-sm"
                >
                  <span className="font-medium">{t.test.name}</span>
                  <span className="tabular-nums">
                    {t.score.toFixed(1).replace(".", ",")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-display text-lg font-semibold tracking-tight">
          TrackMan-økter ({player.trackManSessions.length})
        </h3>
        {player.trackManSessions.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            Ingen TrackMan-data.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {player.trackManSessions.map((tm) => (
              <li
                key={tm.id}
                className="flex items-center justify-between px-4 py-2.5 text-sm"
              >
                <span>
                  {tm.recordedAt.toLocaleDateString("nb-NO", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {tm.shotCount} slag
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-xl font-semibold tabular-nums text-foreground">
        {value}
      </div>
      {sub && <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}
