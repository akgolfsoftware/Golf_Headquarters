/**
 * PlayerHQ Coach Øvelser (/portal/coach/ovelser) — hybrid-design 2026-06-17.
 *
 * Viser øvelsesbiblioteket som et 2-kolonners grid (etter design-fasit "Innhold").
 * Filter-chips per pyramideområde. Data-henting uendret.
 *
 * NB: denne ruten krever COACH/ADMIN-rolle — spillere ser øvelsene via
 * /portal/tren/ovelser (som har eget bibliotek).
 */

import Link from "next/link";
import { ArrowLeft, Dumbbell, Plus } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { ExerciseCard } from "@/components/portal/exercise-card";
import { ExerciseCardActions } from "@/components/portal/exercise-card-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { PyramidArea, type Prisma } from "@/generated/prisma/client";

type Search = { area?: string; phase?: string };

const PYR_OMRADER: { value: PyramidArea | "ALLE"; label: string }[] = [
  { value: "ALLE", label: "Alle" },
  { value: "FYS", label: "FYS" },
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
    <div className="mx-auto max-w-[430px] pb-24 pt-2 md:max-w-[1240px] md:pb-8">
      {/* Tilbake */}
      <div className="mb-3 px-4 md:px-0">
        <Link
          href="/portal/coach"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Coach
        </Link>
      </div>

      {/* Header */}
      <div className="mb-4 flex items-start justify-between px-4 md:px-0">
        <div>
          <h1 className="font-display text-[20px] font-bold leading-[1.06] tracking-[-0.02em] text-foreground">
            Øvelser fra{" "}
            <em className="font-medium italic text-primary">Anders</em>
          </h1>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
            {exercises.length} øvelse{exercises.length === 1 ? "" : "r"} i biblioteket
          </p>
        </div>
        <Link
          href="/portal/coach/ovelser/ny"
          className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 font-mono text-[10.5px] font-bold uppercase tracking-[0.06em] transition hover:brightness-95"
          style={{ background: "#005840", color: "#D1F843" }}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          Ny øvelse
        </Link>
      </div>

      {/* Filter-chips */}
      <div className="mb-4 flex gap-2 overflow-x-auto px-4 pb-1 md:px-0">
        {PYR_OMRADER.map((o) => {
          const aktiv = o.value === valgtArea;
          return (
            <Link
              key={o.value}
              href={bygglenke(o.value)}
              className={`inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] transition-colors ${
                aktiv
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40"
              }`}
            >
              {o.label}
            </Link>
          );
        })}
      </div>

      {/* Grid */}
      <div className="px-3 md:px-0">
        {exercises.length === 0 ? (
          <EmptyState
            icon={Dumbbell}
            titleItalic="Ingen øvelser"
            titleTrail="ennå"
            sub="Opprett den første øvelsen for å begynne å bygge treningsbiblioteket."
            cta={
              <Link
                href="/portal/coach/ovelser/ny"
                className="inline-flex items-center rounded-full px-6 py-2.5 font-mono text-[13px] font-bold uppercase tracking-[0.06em] transition hover:brightness-95"
                style={{ background: "#005840", color: "#D1F843" }}
              >
                Opprett øvelse
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-4">
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
    </div>
  );
}
