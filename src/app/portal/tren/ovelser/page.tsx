import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { ExerciseCard } from "@/components/portal/exercise-card";
import {
  PyramidArea,
  LPhase,
  type Prisma,
} from "@/generated/prisma/client";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

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

  const harAktiveFiltre = valgtArea !== "ALLE" || valgtPhase !== "ALLE";

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PlayerHQ · Trening · Bibliotek"
        titleLead="Drills"
        titleItalic="og øvelser"
        sub={`${exercises.length} øvelse${exercises.length === 1 ? "" : "r"} sortert etter pyramide-område og L-fase. Tilpasset deg.`}
      />

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
        <EmptyState
          icon={Dumbbell}
          titleItalic="Ingen øvelser"
          titleTrail={harAktiveFiltre ? "matcher filtrene" : "i biblioteket ennå"}
          sub={
            harAktiveFiltre
              ? "Prøv å endre eller fjerne filtrene for å se flere øvelser."
              : "Coachen din legger til øvelser etter hvert. Sjekk innom igjen senere."
          }
          cta={
            harAktiveFiltre ? (
              <Link
                href="/portal/tren/ovelser"
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Nullstill filtre
              </Link>
            ) : undefined
          }
        />
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
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
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
  );
}
