import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { ExerciseCard } from "@/components/portal/exercise-card";
import {
  PyramidArea,
  LPhase,
  type Prisma,
} from "@/generated/prisma/client";

type Search = { area?: string; phase?: string };

const PYR_OMRADER: { value: PyramidArea | "ALLE"; label: string }[] = [
  { value: "ALLE", label: "Alle" },
  { value: "FYS", label: "Fysisk" },
  { value: "TEK", label: "Teknisk" },
  { value: "SLAG", label: "Slag" },
  { value: "SPILL", label: "Spill" },
  { value: "TURN", label: "Turnering" },
];

const L_FASER: { value: LPhase | "ALLE"; label: string }[] = [
  { value: "ALLE", label: "Alle" },
  { value: "KROPP", label: "Kropp" },
  { value: "ARM", label: "Arm" },
  { value: "KOLLE", label: "Kølle" },
  { value: "BALL", label: "Ball" },
  { value: "AUTO", label: "Auto" },
];

export default async function OvelserPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requirePortalUser();
  const params = await searchParams;

  const valgtArea =
    params.area && PYR_OMRADER.some((o) => o.value === params.area)
      ? (params.area as PyramidArea | "ALLE")
      : "ALLE";
  const valgtPhase =
    params.phase && L_FASER.some((p) => p.value === params.phase)
      ? (params.phase as LPhase | "ALLE")
      : "ALLE";

  const where: Prisma.ExerciseDefinitionWhereInput = {};
  if (valgtArea !== "ALLE") where.pyramidArea = valgtArea;
  if (valgtPhase !== "ALLE") where.lPhase = valgtPhase;

  const exercises = await prisma.exerciseDefinition.findMany({
    where,
    orderBy: [{ pyramidArea: "asc" }, { name: "asc" }],
  });

  function bygglenke(area: string, phase: string): string {
    const sp = new URLSearchParams();
    if (area !== "ALLE") sp.set("area", area);
    if (phase !== "ALLE") sp.set("phase", phase);
    const qs = sp.toString();
    return `/portal/tren/ovelser${qs ? "?" + qs : ""}`;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
          Øvelser ({exercises.length})
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Bibliotek av drills sortert etter pyramide-område og L-fase.
        </p>
      </div>

      <div className="space-y-3">
        <FilterRad
          label="Område"
          options={PYR_OMRADER}
          valgt={valgtArea}
          bygglenke={(v) => bygglenke(v, valgtPhase)}
        />
        <FilterRad
          label="L-fase"
          options={L_FASER}
          valgt={valgtPhase}
          bygglenke={(v) => bygglenke(valgtArea, v)}
        />
      </div>

      {exercises.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          Ingen øvelser matcher filtrene.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exercises.map((e) => (
            <ExerciseCard key={e.id} exercise={e} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterRad({
  label,
  options,
  valgt,
  bygglenke,
}: {
  label: string;
  options: { value: string; label: string }[];
  valgt: string;
  bygglenke: (verdi: string) => string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
        {label}:
      </span>
      {options.map((o) => {
        const aktiv = o.value === valgt;
        return (
          <Link
            key={o.value}
            href={bygglenke(o.value)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              aktiv
                ? "bg-primary text-primary-foreground"
                : "border border-input bg-card text-foreground hover:border-border"
            }`}
          >
            {o.label}
          </Link>
        );
      })}
    </div>
  );
}
