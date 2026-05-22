import Link from "next/link";
import { Trophy, Target, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { EmptyState } from "@/components/shared/empty-state";

const ACHIEVEMENT_LABELS: Record<string, { tittel: string; ikon: typeof Trophy }> = {
  STREAK_7: { tittel: "7 dager på rad", ikon: Trophy },
  STREAK_14: { tittel: "14 dager på rad", ikon: Trophy },
  STREAK_30: { tittel: "30 dager på rad", ikon: Trophy },
  FIRST_ROUND: { tittel: "Første registrerte runde", ikon: Target },
  FIRST_TEST: { tittel: "Første gjennomførte test", ikon: Target },
  SG_POSITIVE_30D: { tittel: "SG positiv siste 30 dager", ikon: Trophy },
  HCP_DOWN: { tittel: "HCP gikk ned", ikon: Trophy },
  ROUND_BEST: { tittel: "Ny personlig rekord", ikon: Trophy },
};

const GOAL_TYPE_LABELS: Record<string, string> = {
  HCP_TARGET: "HCP-mål",
  ROUNDS_PER_MONTH: "Runder per måned",
  SG_AREA: "SG-område",
  FREE_TEXT: "Eget mål",
};

const GOAL_STATUS: Record<string, { tekst: string; klasse: string }> = {
  ACTIVE: { tekst: "Aktivt", klasse: "bg-primary/10 text-primary" },
  ACHIEVED: { tekst: "Oppnådd", klasse: "bg-accent/30 text-accent-foreground" },
  ABANDONED: { tekst: "Avsluttet", klasse: "bg-secondary text-muted-foreground" },
};

export default async function MilepaelerPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const [achievements, goals, rounds] = await Promise.all([
    prisma.achievement.findMany({
      where: { userId: user.id },
      orderBy: { earnedAt: "desc" },
    }),
    prisma.goal.findMany({
      where: { userId: user.id },
      orderBy: [{ status: "asc" }, { targetDate: "asc" }],
    }),
    // Hent eldste + nyeste runde for HCP-trend (forenklet med score-trend)
    prisma.round.findMany({
      where: { userId: user.id },
      orderBy: { playedAt: "desc" },
      take: 50,
    }),
  ]);

  const aktiveMål = goals.filter((g) => g.status === "ACTIVE");
  const oppnådde = goals.filter((g) => g.status === "ACHIEVED");

  const førsteRunde = rounds[rounds.length - 1];
  const sisteRunde = rounds[0];
  const scoreDelta =
    førsteRunde && sisteRunde && rounds.length >= 2
      ? sisteRunde.score - førsteRunde.score
      : null;

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <PageHeader
        eyebrow="PlayerHQ · Mål · Milepæler"
        titleLead="Det du har"
        titleItalic="oppnådd"
        sub="Achievements, mål og HCP-trend."
      />

      {/* HCP-trend kort */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiKort
          ikon={Target}
          label="HCP"
          verdi={user.hcp !== null ? user.hcp.toFixed(1) : "—"}
          sub="Sist oppdatert i profilen"
        />
        <KpiKort
          ikon={CalendarIcon}
          label="Registrerte runder"
          verdi={String(rounds.length)}
          sub={
            scoreDelta !== null
              ? scoreDelta < 0
                ? `${scoreDelta} fra første runde`
                : `+${scoreDelta} fra første`
              : "—"
          }
        />
        <KpiKort
          ikon={Trophy}
          label="Achievements"
          verdi={String(achievements.length)}
          sub="Antall oppnådde milepæler"
        />
      </section>

      {/* Aktive mål */}
      <section className="rounded-lg border border-border bg-card">
        <header className="flex items-center justify-between border-b border-border px-4 py-4 md:px-6">
          <h2 className="font-display text-base font-semibold tracking-tight">
            Aktive mål ({aktiveMål.length})
          </h2>
        </header>
        {aktiveMål.length === 0 ? (
          <div className="px-6 py-8 text-center text-sm text-muted-foreground">
            Ingen aktive mål — sett deg et nytt under «Mål → Nytt mål».
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {aktiveMål.map((g) => (
              <li key={g.id} className="flex items-start gap-4 px-4 py-4 md:px-6">
                <span className="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Target className="h-3.5 w-3.5" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-sm font-semibold">
                    {g.title}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>{GOAL_TYPE_LABELS[g.type] ?? g.type}</span>
                    {g.targetValue !== null && (
                      <span className="font-mono tabular-nums">
                        Mål: {g.targetValue}
                      </span>
                    )}
                    {g.targetDate && (
                      <span>
                        Frist:{" "}
                        {g.targetDate.toLocaleDateString("nb-NO", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.10em] ${
                    GOAL_STATUS.ACTIVE.klasse
                  }`}
                >
                  {GOAL_STATUS.ACTIVE.tekst}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Oppnådde mål */}
      {oppnådde.length > 0 && (
        <section className="rounded-lg border border-border bg-card">
          <header className="border-b border-border px-4 py-4 md:px-6">
            <h2 className="font-display text-base font-semibold tracking-tight">
              Oppnådde mål ({oppnådde.length})
            </h2>
          </header>
          <ul className="divide-y divide-border">
            {oppnådde.map((g) => (
              <li key={g.id} className="flex items-center gap-4 px-4 py-4 md:px-6">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" strokeWidth={1.75} />
                <span className="flex-1 text-sm">{g.title}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                  {g.updatedAt.toLocaleDateString("nb-NO", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Achievements */}
      <section className="rounded-lg border border-border bg-card">
        <header className="border-b border-border px-4 py-4 md:px-6">
          <h2 className="font-display text-base font-semibold tracking-tight">
            Achievements ({achievements.length})
          </h2>
        </header>
        {achievements.length === 0 ? (
          <EmptyState
            icon={Trophy}
            titleItalic="Ingen achievements"
            titleTrail="ennå"
            sub="Registrer din første runde, test eller fullfør en streak for å låse opp."
          />
        ) : (
          <ul className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 md:p-6 lg:grid-cols-3">
            {achievements.map((a) => {
              const def = ACHIEVEMENT_LABELS[a.kind] ?? {
                tittel: a.kind,
                ikon: Trophy,
              };
              const Ikon = def.ikon;
              return (
                <li
                  key={a.id}
                  className="flex items-start gap-4 rounded-md border border-border bg-background p-4"
                >
                  <span className="mt-0.5 inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-accent/30 text-accent-foreground">
                    <Ikon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-display text-sm font-semibold">
                      {def.tittel}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                      {a.earnedAt.toLocaleDateString("nb-NO", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="text-center">
        <Link
          href="/portal/mal/statistikk"
          className="font-mono text-[10px] uppercase tracking-[0.10em] text-primary hover:underline"
        >
          Se SG-statistikk →
        </Link>
      </div>
    </div>
  );
}

function KpiKort({
  ikon: Ikon,
  label,
  verdi,
  sub,
}: {
  ikon: typeof Trophy;
  label: string;
  verdi: string;
  sub?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4 md:p-6">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Ikon className="h-3.5 w-3.5" strokeWidth={1.75} />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-4 font-display text-3xl font-semibold tabular-nums">
        {verdi}
      </div>
      {sub && (
        <div className="mt-1 font-mono text-[10px] text-muted-foreground">
          {sub}
        </div>
      )}
    </div>
  );
}
