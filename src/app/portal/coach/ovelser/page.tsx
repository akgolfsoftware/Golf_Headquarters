import Link from "next/link";
import { Dumbbell, Plus, Trash2, Pencil } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { ExerciseCard } from "@/components/portal/exercise-card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { PyramidArea, type Prisma } from "@/generated/prisma/client";
import { slettOvelse } from "./actions";

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
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader
          eyebrow="CoachHQ · Bibliotek"
          titleLead="Drills og"
          titleItalic="ovelser"
          sub={`${exercises.length} ovelse${exercises.length === 1 ? "" : "r"} i biblioteket`}
        />
        <Link
          href="/portal/coach/ovelser/ny"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Ny ovelse
        </Link>
      </div>

      {/* Filter-strip */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Omraade:
        </span>
        {PYR_OMRADER.map((o) => {
          const aktiv = o.value === valgtArea;
          return (
            <Link
              key={o.value}
              href={bygglenke(o.value)}
              className={`rounded-full px-4 py-1 text-xs font-medium transition-colors ${
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
          titleItalic="Ingen ovelser"
          titleTrail="enda"
          sub="Opprett den forste ovelsen for a begynne a bygge treningsbiblioteket."
          cta={
            <Link
              href="/portal/coach/ovelser/ny"
              className="inline-flex items-center rounded-full bg-primary px-6 py-2.5 text-[13px] font-semibold text-primary-foreground hover:opacity-90"
            >
              Opprett ovelse
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
              actions={
                <div className="flex gap-1">
                  <Link
                    href={`/portal/coach/ovelser/${e.id}/rediger`}
                    className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                    onClick={(ev) => ev.stopPropagation()}
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </Link>
                  <SlettKnapp id={e.id} />
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SlettKnapp({ id }: { id: string }) {
  async function handleSlett() {
    "use server";
    await slettOvelse(id);
  }

  return (
    <form action={handleSlett}>
      <button
        type="submit"
        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={(e) => e.stopPropagation()}
      >
        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
    </form>
  );
}
