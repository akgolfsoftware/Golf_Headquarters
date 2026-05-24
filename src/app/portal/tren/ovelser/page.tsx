/**
 * PlayerHQ · Trening · Øvelsesbibliotek
 *
 * Design: PlayerHQ Øvelsesbibliotek.html (Claude Design, 2026-05-24)
 * - Faner: Alle / FYS / Mine / Coach
 * - Mine: spillerens egne øvelser (source=PLAYER) med lime-grønne kort og Min-badge
 * - Coach: coachens delte øvelser (source=COACH) med grønntonede kort
 * - Alle + FYS: system-øvelser (source=SYSTEM) med eksisterende filtrering
 */

import Link from "next/link";
import { ChevronRight, Dumbbell, Search, User } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import type { ExerciseDefinition } from "@/generated/prisma/client";
import { LeggTilKnapp } from "./_components/legg-til-knapp";

type Tab = "alle" | "fys" | "mine" | "coach";
type SearchParams = { tab?: string; q?: string };

const TABS: { value: Tab; label: string }[] = [
  { value: "alle", label: "Alle" },
  { value: "fys", label: "FYS" },
  { value: "mine", label: "Mine" },
  { value: "coach", label: "Coach" },
];

export default async function OvelserPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requirePortalUser();
  const params = await searchParams;
  const tab: Tab =
    params.tab === "fys" || params.tab === "mine" || params.tab === "coach"
      ? params.tab
      : "alle";

  // Finn coachens ID via siste CoachingSession
  const sisteSesjon = await prisma.coachingSession.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: { coachId: true },
  });
  const coachId = sisteSesjon?.coachId ?? null;

  // Hent øvelser basert på aktiv fane
  const [exercises, mineCount, coachCount] = await Promise.all([
    fetchExercises(tab, user.id, coachId),
    prisma.exerciseDefinition.count({ where: { source: "PLAYER", createdBy: user.id } }),
    coachId
      ? prisma.exerciseDefinition.count({
          where: { source: "COACH", visibility: "COACH_PLAYERS", createdBy: coachId },
        })
      : Promise.resolve(0),
  ]);

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="mb-5">
        <Link
          href="/portal/tren"
          className="mb-4 inline-flex items-center gap-1 font-mono text-[12px] font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronRight size={14} strokeWidth={1.5} className="rotate-180" />
          Trening
        </Link>

        <div className="mx-3 rounded-[18px] bg-primary px-5 py-4">
          <p className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] text-primary-foreground/65">
            PlayerHQ · Trening
          </p>
          <h1 className="font-display mt-0.5 text-[20px] font-bold tracking-tight text-accent">
            Øvelsesbibliotek
          </h1>
        </div>
      </div>

      {/* Søkefelt */}
      <div className="relative mx-3 mb-4">
        <Search
          size={14}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <div className="w-full rounded-xl bg-secondary/70 py-2.5 pl-9 pr-4 text-[13px] text-muted-foreground">
          Søk i øvelser...
        </div>
      </div>

      {/* Tab-bar */}
      <div className="flex border-b border-border">
        {TABS.map((t) => {
          const aktiv = t.value === tab;
          const href = `/portal/tren/ovelser${t.value === "alle" ? "" : `?tab=${t.value}`}`;
          const count =
            t.value === "mine" ? mineCount : t.value === "coach" ? coachCount : null;
          return (
            <Link
              key={t.value}
              href={href}
              className={`flex-1 py-3 text-center text-[12px] font-medium transition-colors ${
                aktiv
                  ? "border-b-2 border-primary font-bold text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
              {count !== null && count > 0 && (
                <span
                  className={`ml-1 rounded-full px-1.5 py-0.5 font-mono text-[9px] ${
                    aktiv ? "bg-primary text-accent" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Innhold */}
      <div className="px-4 py-4">
        {tab === "mine" && (
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Mine øvelser ({exercises.length})
            </span>
            <LeggTilKnapp />
          </div>
        )}

        {tab === "coach" && (
          <div className="mb-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Fra din coach ({exercises.length})
            </span>
          </div>
        )}

        {tab === "alle" && (
          <div className="mb-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Alle øvelser ({exercises.length})
            </span>
          </div>
        )}

        {tab === "fys" && (
          <div className="mb-4">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              Fysiske øvelser ({exercises.length})
            </span>
          </div>
        )}

        {exercises.length === 0 ? (
          <TomListe tab={tab} />
        ) : (
          <div className="space-y-2.5">
            {exercises.map((e) => (
              <OvelseKort key={e.id} exercise={e} tab={tab} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .font-display {
          font-family: var(--font-inter-tight, 'Inter Tight', system-ui, sans-serif);
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Data-henting
// ---------------------------------------------------------------------------

async function fetchExercises(
  tab: Tab,
  userId: string,
  coachId: string | null,
): Promise<ExerciseDefinition[]> {
  if (tab === "mine") {
    return prisma.exerciseDefinition.findMany({
      where: { source: "PLAYER", createdBy: userId },
      orderBy: { createdAt: "desc" },
    });
  }
  if (tab === "coach") {
    if (!coachId) return [];
    return prisma.exerciseDefinition.findMany({
      where: { source: "COACH", visibility: "COACH_PLAYERS", createdBy: coachId },
      orderBy: { name: "asc" },
    });
  }
  if (tab === "fys") {
    return prisma.exerciseDefinition.findMany({
      where: { source: "SYSTEM", pyramidArea: "FYS" },
      orderBy: { name: "asc" },
    });
  }
  // "alle" — system-øvelser (SYSTEM)
  return prisma.exerciseDefinition.findMany({
    where: { source: "SYSTEM" },
    orderBy: [{ pyramidArea: "asc" }, { name: "asc" }],
  });
}

// ---------------------------------------------------------------------------
// Subkomponenter
// ---------------------------------------------------------------------------

function OvelseKort({
  exercise,
  tab,
}: {
  exercise: ExerciseDefinition;
  tab: Tab;
}) {
  const erMin = tab === "mine";
  const erCoach = tab === "coach";

  return (
    <div
      className={`rounded-2xl border p-4 ${
        erMin
          ? "border-accent/60 bg-accent/10"
          : erCoach
            ? "border-primary/20 bg-primary/5"
            : "border-border bg-card"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold text-foreground">
            {exercise.name}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            {erMin && (
              <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] font-bold text-accent-foreground">
                Min
              </span>
            )}
            {erCoach && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                Coach
              </span>
            )}
            {!erMin && !erCoach && (
              <span className="rounded-full bg-secondary px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                {exercise.pyramidArea}
              </span>
            )}
            {exercise.defaultRepsSets && (
              <span className="font-mono text-[11px] text-muted-foreground">
                {exercise.defaultRepsSets}
              </span>
            )}
            {exercise.muscleGroups.length > 0 && (
              <span className="font-mono text-[11px] text-muted-foreground">
                {exercise.muscleGroups.slice(0, 2).join(", ")}
                {exercise.muscleGroups.length > 2 &&
                  ` +${exercise.muscleGroups.length - 2}`}
              </span>
            )}
            {exercise.utstyr.length > 0 && (
              <span className="font-mono text-[11px] text-muted-foreground">
                {exercise.utstyr.slice(0, 2).join(" · ")}
              </span>
            )}
          </div>
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary">
          <Dumbbell size={15} strokeWidth={1.5} className="text-muted-foreground" />
        </div>
      </div>
      {exercise.description && (
        <p className="mt-2 line-clamp-2 text-[12px] text-muted-foreground">
          {exercise.description}
        </p>
      )}
    </div>
  );
}

function TomListe({ tab }: { tab: Tab }) {
  const meldinger: Record<Tab, { tittel: string; sub: string; visLeggTil: boolean }> = {
    mine: {
      tittel: "Ingen egne øvelser ennå",
      sub: "Trykk «Legg til» for å opprette din første egendefinerte øvelse.",
      visLeggTil: true,
    },
    coach: {
      tittel: "Ingen coachøvelser delt",
      sub: "Coachen din har ikke delt egne øvelser med deg ennå.",
      visLeggTil: false,
    },
    alle: {
      tittel: "Tom øvelsesbank",
      sub: "Ingen øvelser er lagt til i systemet ennå.",
      visLeggTil: false,
    },
    fys: {
      tittel: "Ingen FYS-øvelser",
      sub: "Ingen fysiske øvelser funnet i biblioteket.",
      visLeggTil: false,
    },
  };

  const { tittel, sub, visLeggTil } = meldinger[tab];

  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <User size={22} strokeWidth={1.5} className="text-muted-foreground" />
      </div>
      <div>
        <p className="font-semibold text-foreground">{tittel}</p>
        <p className="mt-1 max-w-[220px] text-[13px] text-muted-foreground">{sub}</p>
      </div>
      {visLeggTil && <LeggTilKnapp />}
    </div>
  );
}
