/**
 * PlayerHQ · Mål · Baner
 *
 * Hybrid design: bane-bibliotek med 2-kolonne grid.
 * Viser CourseDefinition fra DB. Runde-antall per bane kommer i V2.
 */

import Link from "next/link";
import { ArrowLeft, Map, Plus } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";

export default async function BanerPage() {
  await requirePortalUser();

  const courses = await prisma.courseDefinition.findMany({
    orderBy: { name: "asc" },
    take: 20,
  });

  return (
    <div className="mx-auto max-w-[1240px] space-y-6 px-4 pb-20 sm:px-6 md:space-y-8 md:pb-0">
      {/* Back link */}
      <Link
        href="/portal/mal"
        className="inline-flex h-11 items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Tilbake til Mål
      </Link>

      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Bane<em className="not-italic text-primary">-bibliotek</em>
        </h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          {courses.length} baner
        </p>
      </div>

      {courses.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
            <Map className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-display text-base font-semibold text-foreground">
              Ingen runder ennå
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Logg din første runde for å se bane-data.
            </p>
          </div>
          <Link
            href="/portal/mal/runder/ny"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Logg runde
          </Link>
        </div>
      ) : (
        /* Bane-grid */
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {courses.map((course) => (
            <BaneCard key={course.id} id={course.id} name={course.name} rounds={0} avgScore={null} />
          ))}
        </div>
      )}
    </div>
  );
}

function BaneCard({
  id,
  name,
  rounds,
  avgScore,
}: {
  id: string;
  name: string;
  rounds: number;
  avgScore: number | null;
}) {
  return (
    <Link
      href={`/portal/mal/baner/${id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-sm transition-all"
    >
      {/* Course image placeholder */}
      <div className="relative h-[72px] bg-gradient-to-br from-[#2f5a2c] to-[#0a2417]">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 20px)",
          }}
        />
        {/* Rounds badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5">
          <span className="font-mono text-[10px] font-semibold text-accent">
            {rounds} runder
          </span>
        </div>
      </div>

      {/* Card bottom */}
      <div className="px-3 py-2.5">
        <p className="truncate text-[13px] font-semibold text-foreground leading-tight">
          {name}
        </p>
        <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
          {avgScore != null ? `Snitt brutto: ${avgScore.toFixed(1)}` : "Snitt brutto: —"}
        </p>
      </div>
    </Link>
  );
}
