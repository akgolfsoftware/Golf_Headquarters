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

import { prisma } from "@/lib/prisma";
import type {
  DrillFasilitet,
  PyramidArea,
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
 * Alle drills spilleren har tilgang til, sortert akse → navn.
 * Inkluderer SYSTEM + relevante COACH + egne PLAYER-drills.
 * Tom database gir tom liste (UI viser ærlig tom-tilstand).
 */
export async function getDrillLibrary(userId: string): Promise<DrillCard[]> {
  const coachIds = await getMyCoachIds(userId);

  const rows = await prisma.exerciseDefinition.findMany({
    where: {
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
    },
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
