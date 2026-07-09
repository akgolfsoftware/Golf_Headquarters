/**
 * PlayerHQ · Drill-bibliotek · data-loader
 *
 * Henter drills fra ExerciseDefinition og mapper til en flat, UI-vennlig
 * `DrillCard`-type for mobil-biblioteket (/portal/drills).
 *
 * Tilgangskontroll:
 *   SYSTEM   — alltid synlig for alle
 *   COACH    — synlig hvis visibility=COACH_PLAYERS og coach er spillerens coach,
 *              ELLER PRIVATE og drill ble opprettet av spillerens coach
 *   PLAYER   — kun spillerens egne drills (createdBy = userId)
 *
 * Ærlige felter — alt kommer fra ekte kolonner:
 *   axis          ← pyramidArea (FYS/TEK/SLAG/SPILL/TURN)
 *   axisLabel     ← pyramidArea + skillArea ("SLAG · TILNÆRMING")
 *   meta          ← durationMin / sett×reps / CS-target
 *   difficulty    ← intensitet (1–10) bucketet til lett/middels/hard
 *   fasilitet     ← fasilitetKrav (enum-liste)
 *   chsLink       ← FYS-drill med CS-target (csMin/csMax) = koblet til køllehastighet
 *
 * Ratinger finnes IKKE som aggregat i databasen, så stjerne-rating utelates
 * bevisst i UI (ingen falske tall).
 */

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import type {
  DrillFasilitet,
  DrillPracticeType,
  ExerciseSource,
  LPhase,
  NgfKategori,
  PyramidArea,
  SessionEnvironment,
  SkillArea,
} from "@/generated/prisma/client";

export type DrillAxis = "fys" | "tek" | "slag" | "spill" | "turn";
export type DrillDifficulty = "lett" | "middels" | "hard";

export type DrillCard = {
  id: string;
  axis: DrillAxis;
  /** Mono-caps eyebrow, f.eks. "SLAG · TILNÆRMING". */
  axisLabel: string;
  title: string;
  /** Korte meta-fragmenter (varighet, sett/reps, CS) i visningsrekkefølge. */
  meta: string[];
  difficulty: DrillDifficulty | null;
  fasilitet: DrillFasilitet[];
  /** Sann for FYS-drills med CS-target — vises som CS-koblings-badge. */
  chsLink: boolean;
};

const PYR_TO_AXIS: Record<PyramidArea, DrillAxis> = {
  FYS: "fys",
  TEK: "tek",
  SLAG: "slag",
  SPILL: "spill",
  TURN: "turn",
};

const AXIS_NB: Record<DrillAxis, string> = {
  fys: "FYS",
  tek: "TEK",
  slag: "SLAG",
  spill: "SPILL",
  turn: "TURN",
};

const SKILL_NB: Record<SkillArea, string> = {
  TEE_TOTAL: "TEE",
  TILNAERMING: "TILNÆRMING",
  AROUND_GREEN: "NÆRSPILL",
  PUTTING: "PUTTING",
  SPILL: "SPILL",
};

/** intensitet 1–10 → tre nivåer. null når intensitet mangler. */
function toDifficulty(intensitet: number | null): DrillDifficulty | null {
  if (intensitet === null) return null;
  if (intensitet <= 3) return "lett";
  if (intensitet <= 6) return "middels";
  return "hard";
}

/** Bygg meta-liste fra ekte felter — hopper over det som mangler. */
function buildMeta(d: {
  durationMin: number | null;
  defaultSets: number | null;
  defaultReps: number | null;
  defaultRepsSets: string | null;
  csMin: number | null;
  csMax: number | null;
}): string[] {
  const out: string[] = [];

  if (d.durationMin !== null) out.push(`${d.durationMin} MIN`);

  if (d.defaultSets !== null && d.defaultReps !== null) {
    out.push(`${d.defaultSets}×${d.defaultReps}`);
  } else if (d.defaultRepsSets) {
    out.push(d.defaultRepsSets.toUpperCase());
  }

  if (d.csMin !== null && d.csMax !== null) {
    out.push(d.csMin === d.csMax ? `CS ${d.csMin}` : `CS ${d.csMin}–${d.csMax}`);
  } else if (d.csMin !== null) {
    out.push(`CS ${d.csMin}+`);
  } else if (d.csMax !== null) {
    out.push(`CS ≤${d.csMax}`);
  }

  return out;
}

/**
 * Hent coach-IDer spilleren er enrollert under (aktive enrolleringer).
 * Returnerer tom liste hvis spilleren ikke har noen aktiv coach.
 */
async function getMyCoachIds(userId: string): Promise<string[]> {
  const enrollments = await prisma.playerEnrollment.findMany({
    where: { userId, endedAt: null, coachId: { not: null } },
    select: { coachId: true },
  });
  return enrollments
    .map((e) => e.coachId)
    .filter((id): id is string => id !== null);
}

/**
 * Delt tilgangs-filter for drill-biblioteket (SYSTEM + relevante COACH + egne
 * PLAYER). Sikkerhetskritisk — deles av alle drill-lastere så gatingen aldri
 * kan divergere mellom listen (/portal/drills) og detalj-varianten (v2).
 */
function drillAccessWhere(
  userId: string,
  coachIds: string[],
): Prisma.ExerciseDefinitionWhereInput {
  return {
    OR: [
      // Alle system-drills er alltid synlige.
      { source: "SYSTEM" },
      // Coach-drills: enten delt med alle coachens spillere,
      // eller privat men coachen er spillerens coach.
      ...(coachIds.length > 0
        ? [
            {
              source: "COACH" as const,
              visibility: "COACH_PLAYERS" as const,
              createdBy: { in: coachIds },
            },
            {
              source: "COACH" as const,
              visibility: "PRIVATE" as const,
              createdBy: { in: coachIds },
            },
          ]
        : []),
      // Spillerens egne drills.
      { source: "PLAYER", createdBy: userId },
    ],
  };
}

/**
 * Alle drills spilleren har tilgang til, sortert akse → navn.
 * Inkluderer SYSTEM + relevante COACH + egne PLAYER-drills.
 * Tom database gir tom liste (UI viser ærlig tom-tilstand).
 */
export async function getDrillLibrary(userId: string): Promise<DrillCard[]> {
  const coachIds = await getMyCoachIds(userId);

  const rows = await prisma.exerciseDefinition.findMany({
    where: drillAccessWhere(userId, coachIds),
    orderBy: [{ pyramidArea: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      pyramidArea: true,
      skillArea: true,
      intensitet: true,
      durationMin: true,
      defaultSets: true,
      defaultReps: true,
      defaultRepsSets: true,
      csMin: true,
      csMax: true,
      fasilitetKrav: true,
      source: true,
    },
  });

  return rows.map((d) => {
    const axis = PYR_TO_AXIS[d.pyramidArea];
    const axisLabel = d.skillArea
      ? `${AXIS_NB[axis]} · ${SKILL_NB[d.skillArea]}`
      : AXIS_NB[axis];

    return {
      id: d.id,
      axis,
      axisLabel,
      title: d.name,
      meta: buildMeta(d),
      difficulty: toDifficulty(d.intensitet),
      fasilitet: d.fasilitetKrav,
      // CS = clubhead speed i dette systemet — FYS-drill med CS-target er
      // direkte koblet til køllehastighet.
      chsLink: axis === "fys" && (d.csMin !== null || d.csMax !== null),
    };
  });
}

/* ───────────────────────────────────────────────────────────────────────────
 * Rik detalj-variant for v2-øvelsesbanken (galleri + detaljpanel).
 * Samme tilgangs-filter som getDrillLibrary, men returnerer ALLE ekte AK-formel-
 * felter fra ExerciseDefinition slik at v2-panelet slipper å fabrikere noe.
 * Felt som IKKE finnes på definisjonen (press-nivå/PR, P-posisjoner, per-spiller-
 * anbefaling) utelates bevisst — se OvelsesbankV2 sin gap-liste.
 * ───────────────────────────────────────────────────────────────────────── */

export type DrillDetail = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  /** Pyramide-akse (FYS/TEK/SLAG/SPILL/TURN). */
  axis: PyramidArea;
  /** Slagområde / fokus (skillArea). */
  skillArea: SkillArea | null;
  /** Læringsfase (GRUNN/SPESIAL/TURNERING). */
  lPhase: LPhase | null;
  /** Øvingsmetode (BLOKK/VARIABEL/KONKURRANSE/SPILL_TEST). */
  practiceType: DrillPracticeType | null;
  csMin: number | null;
  csMax: number | null;
  durationMin: number | null;
  /** Miljø der øvelsen kjøres. */
  environment: SessionEnvironment[];
  utstyr: string[];
  muscleGroups: string[];
  defaultSets: number | null;
  defaultReps: number | null;
  defaultRepsSets: string | null;
  /** Nivåspenn (NGF-kategori A–L) øvelsen dekker. */
  minKategori: NgfKategori | null;
  maxKategori: NgfKategori | null;
  /** Ekte A–K-tilpasning: CS-mål per NGF-kategori ({A:95,B:90,…}). */
  csTargetByKategori: Record<string, number> | null;
  fasilitetKrav: DrillFasilitet[];
  source: ExerciseSource;
};

// csTargetByKategori er en fri Json-kolonne — valideres ved read (gotcha-regel:
// aldri `as unknown as` på Prisma-Json for visningskritiske data).
const csTargetSchema = z.record(z.string(), z.number());

function parseCsTarget(json: unknown): Record<string, number> | null {
  if (json == null) return null;
  const res = csTargetSchema.safeParse(json);
  return res.success && Object.keys(res.data).length > 0 ? res.data : null;
}

/**
 * Alle drills spilleren har tilgang til, med fullt AK-formel-parametersett.
 * Sortert akse → navn. Tom database gir tom liste (UI viser ærlig tom-tilstand).
 */
export async function getDrillLibraryRich(
  userId: string,
): Promise<DrillDetail[]> {
  const coachIds = await getMyCoachIds(userId);

  const rows = await prisma.exerciseDefinition.findMany({
    where: drillAccessWhere(userId, coachIds),
    orderBy: [{ pyramidArea: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      videoUrl: true,
      pyramidArea: true,
      skillArea: true,
      lPhase: true,
      treningstype: true,
      csMin: true,
      csMax: true,
      durationMin: true,
      environment: true,
      utstyr: true,
      muscleGroups: true,
      defaultSets: true,
      defaultReps: true,
      defaultRepsSets: true,
      minKategori: true,
      maxKategori: true,
      csTargetByKategori: true,
      fasilitetKrav: true,
      source: true,
    },
  });

  return rows.map((d) => ({
    id: d.id,
    title: d.name,
    description: d.description,
    imageUrl: d.imageUrl,
    videoUrl: d.videoUrl,
    axis: d.pyramidArea,
    skillArea: d.skillArea,
    lPhase: d.lPhase,
    practiceType: d.treningstype,
    csMin: d.csMin,
    csMax: d.csMax,
    durationMin: d.durationMin,
    environment: d.environment,
    utstyr: d.utstyr,
    muscleGroups: d.muscleGroups,
    defaultSets: d.defaultSets,
    defaultReps: d.defaultReps,
    defaultRepsSets: d.defaultRepsSets,
    minKategori: d.minKategori,
    maxKategori: d.maxKategori,
    csTargetByKategori: parseCsTarget(d.csTargetByKategori),
    fasilitetKrav: d.fasilitetKrav,
    source: d.source,
  }));
}
