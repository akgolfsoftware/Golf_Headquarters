/**
 * CoachHQ — Drill-bibliotek
 *
 * Oversikt over alle ExerciseDefinition-rader med søk og filter
 * (disiplin, skillArea, NGF-kategori-range, environment, MORAD).
 *
 * Filter implementeres som GET-params slik at staten er delelig
 * og kan kjøres som SSR. Klient-komponenten håndterer kun
 * input-state og synker tilbake til URL.
 */

import Link from "next/link";
import { Dumbbell, Star } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";
import type {
  PyramidArea,
  SkillArea,
  NgfKategori,
  SessionEnvironment,
} from "@/generated/prisma/enums";
import { DrillFilterBar } from "./drill-filter-bar";

const NGF_ORDER: readonly NgfKategori[] = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
] as const;

function ngfIndex(k: NgfKategori | null | undefined): number {
  if (!k) return -1;
  return NGF_ORDER.indexOf(k);
}

const DISCIPLIN_LABEL: Record<PyramidArea, string> = {
  FYS: "FYS",
  TEK: "TEK",
  SLAG: "SLAG",
  SPILL: "SPILL",
  TURN: "TURN",
};

const DISCIPLIN_STYLE: Record<PyramidArea, string> = {
  FYS: "bg-primary/15 text-primary",
  TEK: "bg-accent/30 text-accent-foreground",
  SLAG: "bg-secondary text-foreground",
  SPILL: "bg-primary/10 text-primary",
  TURN: "bg-foreground text-background dark:bg-card",
};

const SKILL_LABEL: Record<SkillArea, string> = {
  TEE_TOTAL: "Tee",
  TILNAERMING: "Tilnaerming",
  AROUND_GREEN: "Rundt green",
  PUTTING: "Putt",
  SPILL: "Spill",
};

const ENV_LABEL: Record<SessionEnvironment, string> = {
  RANGE: "Range",
  BANE: "Bane",
  STUDIO: "Studio",
  HJEM: "Hjem",
  SIMULATOR: "Sim",
  GYM: "Gym",
};

type Sp = {
  q?: string;
  disiplin?: string; // CSV
  skill?: string; // CSV
  minNgf?: string;
  maxNgf?: string;
  env?: string; // CSV
  morad?: string;
};

export default async function DrillsAdmin({
  searchParams,
}: {
  searchParams: Promise<Sp>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const disipliner = parseCsv(sp.disiplin) as PyramidArea[];
  const skills = parseCsv(sp.skill) as SkillArea[];
  const envs = parseCsv(sp.env) as SessionEnvironment[];
  const minNgf = (sp.minNgf ?? "") as NgfKategori | "";
  const maxNgf = (sp.maxNgf ?? "") as NgfKategori | "";
  const morad = sp.morad === "1";

  const drills = await prisma.exerciseDefinition.findMany({
    where: {
      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { tags: { has: q } },
        ],
      }),
      ...(disipliner.length > 0 && { pyramidArea: { in: disipliner } }),
      ...(skills.length > 0 && { skillArea: { in: skills } }),
      ...(envs.length > 0 && { environment: { hasSome: envs } }),
      ...(morad && { morad: true }),
    },
    orderBy: [{ pyramidArea: "asc" }, { name: "asc" }],
  });

  // NGF-range-filter gjøres i memory (range-overlapp er enklere her).
  const filtered = drills.filter((d) => {
    if (!minNgf && !maxNgf) return true;
    const dMin = ngfIndex(d.minKategori);
    const dMax = ngfIndex(d.maxKategori);
    const filterMin = minNgf ? ngfIndex(minNgf as NgfKategori) : -1;
    const filterMax = maxNgf ? ngfIndex(maxNgf as NgfKategori) : NGF_ORDER.length;
    if (dMin === -1 && dMax === -1) return true;
    // Range-overlapp
    const drillMin = dMin === -1 ? 0 : dMin;
    const drillMax = dMax === -1 ? NGF_ORDER.length - 1 : dMax;
    return drillMin <= filterMax && drillMax >= filterMin;
  });

  const totalt = await prisma.exerciseDefinition.count();
  const moradAntall = await prisma.exerciseDefinition.count({
    where: { morad: true },
  });
  const disiplinAntall = await prisma.exerciseDefinition.groupBy({
    by: ["pyramidArea"],
    _count: { _all: true },
  });

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <PageHeader
        eyebrow="CoachHQ · /admin/drills"
        titleLead={String(totalt)}
        titleItalic="drills"
        titleTrail={`· ${disiplinAntall.length} disipliner · 12 NGF-nivaaer`}
        sub={`${moradAntall} MORAD-drills · biblioteket er kjernen for AI-planlegging og treningsoekter.`}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href="/admin/drills/ny"
              className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              + Ny drill
            </Link>
          </div>
        }
      />

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <KpiAccent
          label="Totalt"
          value={String(totalt)}
          sub="drills i biblioteket"
        />
        <Kpi
          label="MORAD"
          value={String(moradAntall)}
          sub="kanoniske oevelser"
        />
        <Kpi
          label="Filter treff"
          value={String(filtered.length)}
          sub={filtered.length === totalt ? "alle synlige" : "etter filter"}
        />
        <Kpi
          label="Disipliner"
          value={String(disiplinAntall.length)}
          sub="FYS · TEK · SLAG · SPILL · TURN"
        />
      </div>

      <DrillFilterBar
        initial={{
          q,
          disipliner,
          skills,
          envs,
          minNgf: minNgf || undefined,
          maxNgf: maxNgf || undefined,
          morad,
        }}
      />

      {filtered.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          titleItalic="Ingen drills"
          titleTrail="matcher filteret"
          sub="Proev aa fjerne ett av filter-valgene, eller fortsett aa importere fra ak-second-brain."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => {
            const nivaaRange = formatNgfRange(d.minKategori, d.maxKategori);
            return (
              <Link
                key={d.id}
                href={`/admin/drills/${d.id}`}
                className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-lg sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 font-display text-base font-semibold leading-snug text-foreground">
                    {d.name}
                  </h3>
                  {d.morad && (
                    <span className="flex shrink-0 items-center gap-1 rounded-sm bg-accent/30 px-1.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.04em] text-accent-foreground">
                      <Star size={10} strokeWidth={1.75} />
                      MORAD
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span
                    className={`rounded-sm px-1.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.04em] ${
                      DISCIPLIN_STYLE[d.pyramidArea]
                    }`}
                  >
                    {DISCIPLIN_LABEL[d.pyramidArea]}
                  </span>
                  {d.skillArea && (
                    <span className="rounded-sm bg-secondary px-1.5 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                      {SKILL_LABEL[d.skillArea]}
                    </span>
                  )}
                  {nivaaRange && (
                    <span className="rounded-sm bg-foreground/5 px-1.5 py-1 font-mono text-[10px] font-semibold tabular-nums text-foreground">
                      {nivaaRange}
                    </span>
                  )}
                </div>

                {d.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {d.description}
                  </p>
                )}

                <div className="mt-auto flex items-center justify-between border-t border-border pt-3 font-mono text-[11px] text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-2">
                    {d.durationMin && (
                      <span className="tabular-nums text-foreground">
                        {d.durationMin} min
                      </span>
                    )}
                    {typeof d.intensitet === "number" && (
                      <span className="tabular-nums">
                        intensitet {d.intensitet}/10
                      </span>
                    )}
                  </div>
                  {d.environment.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      {d.environment.slice(0, 3).map((e) => (
                        <span
                          key={e}
                          className="rounded-sm bg-secondary px-1.5 py-0.5 text-[9px] uppercase tracking-[0.04em]"
                        >
                          {ENV_LABEL[e]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono uppercase tracking-[0.06em] text-muted-foreground">
                    {d.kilde ?? "lokal"}
                  </span>
                  <span className="font-mono text-primary group-hover:underline">
                    Rediger
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function parseCsv(v: string | undefined): string[] {
  if (!v) return [];
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function formatNgfRange(
  min: NgfKategori | null,
  max: NgfKategori | null,
): string | null {
  if (!min && !max) return null;
  if (min && max && min === max) return min;
  return `${min ?? "A"}–${max ?? "L"}`;
}

// ----------------- Komponenter -----------------

function KpiAccent({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-transparent bg-foreground p-4 text-background dark:bg-card">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-[rgba(209,248,67,0.70)]">
        {label}
      </div>
      <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-white">
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-[rgba(245,244,238,0.7)]">
          {sub}
        </div>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-foreground">
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-muted-foreground">{sub}</div>
      )}
    </div>
  );
}

