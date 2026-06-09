import Link from "next/link";
import { Dumbbell, Plus } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { ExerciseCard } from "@/components/portal/exercise-card";
import { ExerciseCardActions } from "@/components/portal/exercise-card-actions";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { PyramidArea, type Prisma } from "@/generated/prisma/client";

type Search = { area?: string; phase?: string };

const PYR_OMRADER: { value: PyramidArea | "ALLE"; label: string }[] = [
  { value: "ALLE", label: "Alle" },
  { value: "FYS", label: "Fysisk" },
  { value: "TEK", label: "Teknisk" },
  { value: "SLAG", label: "Slag" },
  { value: "SPILL", label: "Spill" },
  { value: "TURN", label: "Turnering" },
];

export default async function CoachOvelserPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;

  const valgtArea =
    params.area && PYR_OMRADER.some((o) => o.value === params.area)
      ? (params.area as PyramidArea | "ALLE")
      : "ALLE";

  const where: Prisma.ExerciseDefinitionWhereInput = {};
  if (valgtArea !== "ALLE") where.pyramidArea = valgtArea;

  const exercises = await prisma.exerciseDefinition.findMany({
    where,
    orderBy: [{ pyramidArea: "asc" }, { name: "asc" }],
  });

  function bygglenke(area: string): string {
    const sp = new URLSearchParams();
    if (area !== "ALLE") sp.set("area", area);
    const qs = sp.toString();
    return `/portal/coach/ovelser${qs ? "?" + qs : ""}`;
  }

  return (
    <div className="mx-auto max-w-[1240px] space-y-6 px-4 pb-20 sm:px-6 md:space-y-8 md:pb-0">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:justify-between">
        <PageHeader
          eyebrow="AgencyOS · Bibliotek"
          titleLead="Drills og"
          titleItalic="øvelser"
          sub={`${exercises.length} øvelse${exercises.length === 1 ? "" : "r"} i biblioteket`}
        />
        <Link
          href="/portal/coach/ovelser/ny"
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Ny øvelse
        </Link>
      </div>

      {/* Filter-strip */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Område:
        </span>
        {PYR_OMRADER.map((o) => {
          const aktiv = o.value === valgtArea;
          return (
            <Link
              key={o.value}
              href={bygglenke(o.value)}
              className={`inline-flex min-h-9 items-center rounded-full px-4 py-1 text-xs font-medium transition-colors ${
                aktiv
                  ? "bg-primary text-primary-foreground"
                  : "border border-input bg-card text-foreground hover:border-border hover:bg-secondary"
              }`}
            >
              {o.label}
            </Link>
          );
        })}
      </div>

      {exercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          titleItalic="Ingen øvelser"
          titleTrail="ennå"
          sub="Opprett den første øvelsen for å begynne å bygge treningsbiblioteket."
          cta={
            <Link
              href="/portal/coach/ovelser/ny"
              className="inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-[13px] font-semibold text-primary-foreground hover:opacity-90"
            >
              Opprett øvelse
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exercises.map((e) => (
            <ExerciseCard
              key={e.id}
              exercise={e}
              href={`/portal/tren/ovelser/${e.id}`}
              actions={<ExerciseCardActions id={e.id} />}
            />
          ))}
        </div>
      )}
    </div>
  );
}
