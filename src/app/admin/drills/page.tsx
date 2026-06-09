/**
 * /admin/drills — AgencyOS Drill-bibliotek (samme UI som /portal/drills)
 * Design: plan Del 6
 *
 * Coach-versjon: grid + slide-in panel med "Ny drill". Data hentes fra ekte
 * ExerciseDefinition via Prisma og mappes til DrillGrid-komponentenes form.
 * Filtrering går via URL-state (DrillFilterBar) — server-rendrer leser
 * searchParams og filtrerer i Prisma. Tom database gir ærlig tom-tilstand
 * (ingen demo-data, ingen falske tall).
 */

import Link from "next/link";
import { Layers, Plus } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  DrillGrid,
  type DrillCardData,
  type DrillDetailData,
} from "@/components/drills";
import { DrillFilterBar } from "./drill-filter-bar";
import type {
  PyramidArea,
  SkillArea,
  NgfKategori,
  SessionEnvironment,
  LPhase,
} from "@/generated/prisma/enums";
import "@/components/drills/drill.css";

export const dynamic = "force-dynamic";

// ── Etikett-mappinger (ekte enum → norsk visning) ───────────────
const SKILL_LABEL: Record<SkillArea, string> = {
  TEE_TOTAL: "TEE",
  TILNAERMING: "JERNSLAG",
  AROUND_GREEN: "NÆRSPILL",
  PUTTING: "PUTTING",
  SPILL: "SPILL",
};

const PYR_LABEL: Record<PyramidArea, string> = {
  FYS: "FYSISK",
  TEK: "TEKNIKK",
  SLAG: "SLAG",
  SPILL: "SPILL",
  TURN: "TURNERING",
};

const ENV_LABEL: Record<SessionEnvironment, string> = {
  RANGE: "Driving range",
  BANE: "Bane",
  STUDIO: "Studio",
  HJEM: "Hjemme",
  SIMULATOR: "Simulator",
  GYM: "Gym",
};

const LPHASE_LABEL: Record<LPhase, string> = {
  GRUNN: "Grunnfase",
  SPESIAL: "Spesialfase",
  TURNERING: "Konkurransefase",
};

const FASILITET_LABEL: Record<string, string> = {
  RADAR: "Radar",
  MAT_NET: "Matte + nett",
  BUNKER: "Bunker",
  KAMERA: "Kamera",
  PUTTING_GREEN_KORT: "Putting green (kort)",
  PUTTING_GREEN_LANG: "Putting green (lang)",
  SHORT_GAME_AREA: "Nærspillsareal",
  DRIVING_RANGE: "Driving range",
  BANE: "Bane",
  SIMULATOR: "Simulator",
  VEKTSTANG: "Vektstang",
  TRAPBAR: "Trapbar",
  LOPEBANE: "Løpebane",
  MED_BALL: "Medisinball",
};

const NGF_ORDER: readonly NgfKategori[] = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L",
] as const;

/** "D–G", "D+", "≤G" eller "Alle" fra min/max NGF-kategori. */
function ngfRange(min: NgfKategori | null, max: NgfKategori | null): string {
  if (min && max) return min === max ? min : `${min}–${max}`;
  if (min) return `${min}+`;
  if (max) return `≤${max}`;
  return "Alle";
}

/** "3×10", "10 reps" eller "—" fra default-feltene. */
function setsReps(sets: number | null, reps: number | null, txt: string | null): string {
  if (sets !== null && reps !== null) return `${sets}×${reps}`;
  if (txt) return txt;
  if (reps !== null) return `${reps} reps`;
  return "—";
}

// ── searchParams → Prisma where ─────────────────────────────────
function parseList<T extends string>(raw: string | undefined): T[] {
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean) as T[];
}

type Search = {
  q?: string;
  disiplin?: string;
  skill?: string;
  env?: string;
  minNgf?: string;
  maxNgf?: string;
  morad?: string;
};

export default async function CoachDrillsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const sp = await searchParams;

  const disipliner = parseList<PyramidArea>(sp.disiplin);
  const skills = parseList<SkillArea>(sp.skill);
  const envs = parseList<SessionEnvironment>(sp.env);
  const minNgf = (sp.minNgf as NgfKategori | undefined) || undefined;
  const maxNgf = (sp.maxNgf as NgfKategori | undefined) || undefined;
  const morad = sp.morad === "1";
  const q = (sp.q ?? "").trim();

  // Bygg where fra aktive filtre. Tomme filtre = ingen begrensning.
  const where = {
    ...(disipliner.length > 0 && { pyramidArea: { in: disipliner } }),
    ...(skills.length > 0 && { skillArea: { in: skills } }),
    ...(envs.length > 0 && { environment: { hasSome: envs } }),
    ...(minNgf && { minKategori: minNgf }),
    ...(maxNgf && { maxKategori: maxNgf }),
    ...(morad && { morad: true }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { description: { contains: q, mode: "insensitive" as const } },
        { tags: { has: q } },
      ],
    }),
  };

  const drillsRaw = await prisma.exerciseDefinition.findMany({
    where,
    orderBy: [{ pyramidArea: "asc" }, { name: "asc" }],
    include: { _count: { select: { sessionDrills: true } } },
  });

  // Kategori-tellinger for filter-chips (uavhengig av aktivt filter → totaler).
  const total = await prisma.exerciseDefinition.count();

  // Map til DrillCardData (grid-kort)
  const cards: DrillCardData[] = drillsRaw.map((d) => ({
    id: d.id,
    skillArea: d.skillArea ? SKILL_LABEL[d.skillArea] : PYR_LABEL[d.pyramidArea],
    title: d.name,
    duration: d.durationMin ?? 0,
    intensity: d.intensitet ?? 0,
    ngfCategoryRange: ngfRange(d.minKategori, d.maxKategori),
    timesTrained: d._count.sessionDrills,
    isCoachRecommended: d.morad,
  }));

  // Map til DrillDetailData (slide-in panel) — full detalj per drill.
  const csTargetOf = (json: unknown): { csMal: number; nivaa: string } => {
    if (json && typeof json === "object" && !Array.isArray(json)) {
      const rec = json as Record<string, unknown>;
      for (const k of NGF_ORDER) {
        const v = rec[k];
        if (typeof v === "number") return { csMal: v, nivaa: k };
      }
    }
    return { csMal: 0, nivaa: "—" };
  };

  const details: Record<string, DrillDetailData> = {};
  for (const d of drillsRaw) {
    const cs = csTargetOf(d.csTargetByKategori);
    const csMal = cs.csMal || d.csMin || d.csMax || 0;
    details[d.id] = {
      id: d.id,
      title: d.name,
      skillArea: d.skillArea ? SKILL_LABEL[d.skillArea] : PYR_LABEL[d.pyramidArea],
      pyramidArea: PYR_LABEL[d.pyramidArea],
      duration: d.durationMin ?? 0,
      intensity: d.intensitet ?? 0,
      setsReps: setsReps(d.defaultSets, d.defaultReps, d.defaultRepsSets),
      environment: d.environment[0] ? ENV_LABEL[d.environment[0]] : "—",
      csMal,
      csMalNivaa: cs.nivaa !== "—" ? cs.nivaa : (d.minKategori ?? "—"),
      treningsfaser: d.lPhases.map((p) => LPHASE_LABEL[p]),
      fasilitetskrav: d.fasilitetKrav.map((f) => ({
        name: FASILITET_LABEL[f] ?? f,
      })),
      description: d.description ?? "Ingen beskrivelse lagret.",
      coachNotes: d.coachNotes ?? undefined,
      tags: d.tags,
    };
  }

  const loadDetail = (id: string) => details[id] ?? null;
  const harAktivtFilter =
    disipliner.length + skills.length + envs.length > 0 || !!minNgf || !!maxNgf || morad || !!q;

  return (
    <div className="drill-scope">
      <div className="drill-page">
        <header className="drill-head">
          <div>
            <div className="eyebrow">COACHHQ · /admin/drills</div>
            <h1>
              Drill <em>-bibliotek</em>
            </h1>
            <p className="drill-sub">
              {total} drill{total === 1 ? "" : "er"} i biblioteket · {drillsRaw.length}{" "}
              treff på valgt filter. Klikk en drill for detaljer og coach-notater.
            </p>
          </div>
          <div className="drill-head-actions">
            <Link
              href="/admin/plans/templates"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-foreground transition-colors hover:bg-secondary"
            >
              <Layers size={13} strokeWidth={1.75} aria-hidden /> Maler
            </Link>
            <Link
              href="/admin/drills/ny"
              className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-primary-foreground transition-opacity hover:opacity-90"
            >
              <Plus size={13} strokeWidth={1.75} aria-hidden /> Ny drill
            </Link>
          </div>
        </header>

        <div className="mb-4">
          <DrillFilterBar
            initial={{
              q,
              disipliner,
              skills,
              envs,
              minNgf,
              maxNgf,
              morad,
            }}
          />
        </div>

        {cards.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-16 text-center">
            <Layers
              className="mx-auto h-8 w-8 text-muted-foreground/40"
              strokeWidth={1.5}
              aria-hidden
            />
            <h2 className="mt-4 font-display text-lg font-bold tracking-[-0.01em] text-foreground">
              {harAktivtFilter ? "Ingen drills matcher filteret" : "Ingen drills ennå"}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              {harAktivtFilter
                ? "Juster eller tilbakestill filteret for å se flere drills."
                : "Drill-biblioteket er tomt. Klikk «Ny drill» øverst for å legge til den første øvelsen."}
            </p>
          </div>
        ) : (
          <DrillGrid drills={cards} loadDetail={loadDetail} />
        )}
      </div>
    </div>
  );
}
