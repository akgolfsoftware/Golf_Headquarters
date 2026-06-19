/**
 * PlayerHQ Coach Øvelser (/portal/coach/ovelser) — hybrid-design 2026-06-17.
 *
 * Øvelsesbibliotek fra coach: 2-kolonners grid med forest-gradient placeholder,
 * lime kategori-chip, filtrer-chips per pyramideområde. Matcher fasit B5 · Innhold.
 */

import Link from "next/link";
import { Dumbbell, Plus } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { ExerciseCardActions } from "@/components/portal/exercise-card-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { PyramidArea, type Prisma } from "@/generated/prisma/client";

type Search = { area?: string };

const FILTER_CHIPS: { value: PyramidArea | "ALLE"; label: string }[] = [
  { value: "ALLE",   label: "Alle" },
  { value: "FYS",    label: "FYS" },
  { value: "TEK",    label: "Teknisk" },
  { value: "SLAG",   label: "Slag" },
  { value: "SPILL",  label: "Spill" },
  { value: "TURN",   label: "Turnering" },
];

// Kortfarm per PyramidArea — mappes mot design-chip-label
const CAT_SHORT: Record<PyramidArea, string> = {
  FYS:  "FYS",
  TEK:  "TEK",
  SLAG: "SLAG",
  SPILL:"SPILL",
  TURN: "TURN",
};

function buildUrl(area: string): string {
  const sp = new URLSearchParams();
  if (area !== "ALLE") sp.set("area", area);
  const qs = sp.toString();
  return `/portal/coach/ovelser${qs ? "?" + qs : ""}`;
}

export default async function CoachOvelserPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const params = await searchParams;

  const valgtArea =
    params.area && FILTER_CHIPS.some((o) => o.value === params.area)
      ? (params.area as PyramidArea | "ALLE")
      : "ALLE";

  const where: Prisma.ExerciseDefinitionWhereInput = {};
  if (valgtArea !== "ALLE") where.pyramidArea = valgtArea as PyramidArea;

  const exercises = await prisma.exerciseDefinition.findMany({
    where,
    orderBy: [{ pyramidArea: "asc" }, { name: "asc" }],
  });

  return (
    <div className="mx-auto max-w-[430px] pb-24 pt-2 md:max-w-[1240px] md:pb-8">

      {/* Header */}
      <div className="mb-4 flex items-start justify-between px-4 md:px-0">
        <div>
          <h1 className="font-display text-[20px] font-bold leading-[1.06] tracking-[-0.02em] text-foreground">
            Øvelser fra
            <em className="font-medium italic text-primary"> Anders</em>
          </h1>
          <p className="mt-1 font-mono text-[10px] text-muted-foreground">
            {exercises.length} øvelse{exercises.length === 1 ? "" : "r"} i biblioteket
          </p>
        </div>
        <Link
          href="/portal/coach/ovelser/ny"
          className="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-[7px] font-mono text-[10px] font-bold uppercase tracking-[0.04em] transition hover:brightness-95"
          style={{ background: "#005840", color: "#D1F843" }}
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          Ny øvelse
        </Link>
      </div>

      {/* Filter-chips — horizontal scroll */}
      <div className="mb-4 flex gap-1.5 overflow-x-auto px-4 pb-1 [-webkit-overflow-scrolling:touch] [scrollbar-width:none] md:px-0">
        {FILTER_CHIPS.map((chip) => {
          const aktiv = chip.value === valgtArea;
          return (
            <Link
              key={chip.value}
              href={buildUrl(chip.value)}
              className={
                "inline-flex shrink-0 items-center rounded-full border px-3 py-[6px] font-mono text-[10.5px] font-semibold uppercase tracking-[0.04em] transition-colors " +
                (aktiv
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40")
              }
            >
              {chip.label}
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
              <OvelseCard key={e.id} exercise={e} actions={<ExerciseCardActions id={e.id} />} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── inline card (matches fasit: forest-gradient placeholder, lime chip) ───

type ExerciseLike = {
  id: string;
  name: string;
  pyramidArea: PyramidArea;
  durationMin: number | null;
  defaultRepsSets: string | null;
};

function OvelseCard({
  exercise,
  actions,
}: {
  exercise: ExerciseLike;
  actions?: React.ReactNode;
}) {
  const cat = CAT_SHORT[exercise.pyramidArea];
  const meta = [exercise.defaultRepsSets, exercise.durationMin ? `${exercise.durationMin} min` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/portal/drills/${exercise.id}`}
      className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md"
    >
      {/* Forest-gradient placeholder med lime grid-overlay */}
      <div
        className="relative h-16"
        style={{ background: "linear-gradient(150deg,#2f5a2c,#0a2417)" }}
      >
        {/* Lime-grid overlay */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(rgba(209,248,67,.25) 1px,transparent 1px),linear-gradient(90deg,rgba(209,248,67,.25) 1px,transparent 1px)",
            backgroundSize: "14px 14px",
          }}
          aria-hidden
        />
        {/* Kategori-chip */}
        <span
          className="absolute bottom-1.5 left-2.5 rounded-full px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase"
          style={{ background: "rgba(0,0,0,.4)", color: "#D1F843" }}
        >
          {cat}
        </span>
        {/* Actions-meny */}
        {actions && (
          <div className="absolute right-2 top-2" onClick={(e) => e.preventDefault()}>
            {actions}
          </div>
        )}
      </div>

      {/* Innhold */}
      <div className="px-2.5 py-2.5">
        <div className="text-[12.5px] font-semibold leading-[1.3] text-foreground">
          {exercise.name}
        </div>
        {meta && (
          <div className="mt-0.5 font-mono text-[9.5px] text-muted-foreground">
            {meta}
          </div>
        )}
      </div>
    </Link>
  );
}
