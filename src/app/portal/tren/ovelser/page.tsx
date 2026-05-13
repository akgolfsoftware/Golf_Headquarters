/**
 * PlayerHQ · Trening · Bibliotek
 *
 * Endelig design — inspirert av treningsdetalj-demo (playerhq-C/10).
 * Hero med italic display, filter-strip og pyramide-fordelt grid.
 */
import Link from "next/link";
import { ChevronRight, Dumbbell, LayoutGrid, TrendingUp } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { ExerciseCard } from "@/components/portal/exercise-card";
import {
  PyramidArea,
  LPhase,
  type Prisma,
} from "@/generated/prisma/client";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

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
  const user = await requirePortalUser();
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

  const [exercises, totalAlle, perArea] = await Promise.all([
    prisma.exerciseDefinition.findMany({
      where,
      orderBy: [{ pyramidArea: "asc" }, { name: "asc" }],
    }),
    prisma.exerciseDefinition.count(),
    prisma.exerciseDefinition.groupBy({
      by: ["pyramidArea"],
      _count: { _all: true },
    }),
  ]);

  function bygglenke(area: string, phase: string): string {
    const sp = new URLSearchParams();
    if (area !== "ALLE") sp.set("area", area);
    if (phase !== "ALLE") sp.set("phase", phase);
    const qs = sp.toString();
    return `/portal/tren/ovelser${qs ? "?" + qs : ""}`;
  }

  const harAktiveFiltre = valgtArea !== "ALLE" || valgtPhase !== "ALLE";
  const fornavn = user.name?.split(" ")[0] ?? null;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div>
        <Link
          href="/portal/tren"
          className="mb-4 inline-flex items-center gap-1 font-mono text-[12px] font-medium text-muted-foreground hover:text-foreground"
        >
          <ChevronRight size={14} strokeWidth={1.5} className="rotate-180" />
          Trening
        </Link>

        <div className="flex flex-wrap items-start gap-6">
          <div className="relative shrink-0">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-primary font-mono text-primary-foreground ring-4 ring-accent">
              <Dumbbell size={26} strokeWidth={1.5} />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <PageHeader
              eyebrow="PlayerHQ · Trening · Bibliotek"
              titleLead="Drills og"
              titleItalic="øvelser"
              sub={`${exercises.length} øvelse${exercises.length === 1 ? "" : "r"} sortert etter pyramide-område og L-fase${fornavn ? `, ${fornavn}.` : "."}`}
            />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatPill label="Totalt" value={String(totalAlle)} />
              <StatPill
                label="Treff"
                value={String(exercises.length)}
                tone={harAktiveFiltre ? "accent" : "muted"}
              />
              {perArea.slice(0, 3).map((p) => (
                <StatPill
                  key={p.pyramidArea}
                  label={p.pyramidArea}
                  value={String(p._count._all)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Insight-banner */}
      {harAktiveFiltre && (
        <div className="flex items-center gap-3 rounded-md border border-accent/50 bg-accent/15 px-5 py-4">
          <TrendingUp size={18} strokeWidth={1.5} className="text-foreground" />
          <p className="text-[14px] text-foreground">
            Filtrerer på{" "}
            <b>
              {valgtArea !== "ALLE" ? labelOf(PYR_OMRADER, valgtArea) : "alle områder"}
            </b>{" "}
            ·{" "}
            <b>
              {valgtPhase !== "ALLE" ? labelOf(L_FASER, valgtPhase) : "alle L-faser"}
            </b>
            . Viser {exercises.length} av {totalAlle} øvelser.
          </p>
        </div>
      )}

      {/* Filter-strip */}
      <section className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-2">
          <LayoutGrid
            size={16}
            strokeWidth={1.5}
            className="text-muted-foreground"
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Filtrer
          </span>
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
      </section>

      {/* Resultat-grid */}
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
                className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground hover:opacity-90"
              >
                Nullstill filtre
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              {exercises.length} øvelse{exercises.length === 1 ? "" : "r"}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((e) => (
              <ExerciseCard key={e.id} exercise={e} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function labelOf(
  options: { value: string; label: string }[],
  v: string,
): string {
  return options.find((o) => o.value === v)?.label ?? v;
}

function StatPill({
  label,
  value,
  tone = "muted",
}: {
  label: string;
  value: string;
  tone?: "muted" | "accent";
}) {
  const styles: Record<NonNullable<typeof tone>, string> = {
    muted: "bg-secondary text-foreground border-border",
    accent: "bg-accent/30 text-foreground border-accent/40",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] ${styles[tone]}`}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono font-semibold tabular-nums">{value}</span>
    </span>
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
