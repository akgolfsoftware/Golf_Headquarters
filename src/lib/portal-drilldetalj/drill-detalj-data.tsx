/**
 * Data-loader for PlayerHQ · Drill-detalj (/portal/drills/[id]).
 *
 * Henter én ekte ExerciseDefinition og mapper til props for drill-detalj-
 * skjermen. Port av public/design-handover/playerhq/components-drill-detalj.html
 * — mobile-first (430px) og uten fabrikerte tall.
 *
 * Prinsipp: alt som vises er utledet fra faktiske felter. Felter som ikke
 * finnes i schemaet (strukturert trinn-liste, drill-rating-snitt) fabrikkeres
 * ALDRI — seksjonen utelates eller utledes fra det som faktisk finnes
 * (f.eks. trinn fra `prerequisites`).
 */

import { prisma } from "@/lib/prisma";
import { kategoriFraHcp } from "@/lib/ai-plan/context";
import {
  DrillParametersSchema,
  M_MILJO,
  TRENINGSOMRADER,
  L_FASER,
  type DrillParameters,
} from "@/lib/taxonomy";
import type {
  PyramidArea,
  SkillArea,
  SessionEnvironment,
} from "@/generated/prisma/client";

export type Axis = "fys" | "tek" | "slag" | "spill" | "turn";

const AREA_TIL_AXIS: Record<PyramidArea, Axis> = {
  FYS: "fys",
  TEK: "tek",
  SLAG: "slag",
  SPILL: "spill",
  TURN: "turn",
};

const AXIS_LABEL: Record<Axis, string> = {
  fys: "Fysisk",
  tek: "Teknisk",
  slag: "Slag",
  spill: "Spill",
  turn: "Turnering",
};

const SKILL_LABEL: Record<SkillArea, string> = {
  TEE_TOTAL: "Tee",
  TILNAERMING: "Tilnærming",
  AROUND_GREEN: "Around green",
  PUTTING: "Putting",
  SPILL: "Spill",
};

const ENV_LABEL: Record<SessionEnvironment, string> = {
  RANGE: "Range",
  BANE: "Bane",
  STUDIO: "Studio",
  HJEM: "Hjemme",
  SIMULATOR: "Simulator",
  GYM: "Gym",
};

/** Én rad i parameter-tabellen. Vises kun når den har en verdi. */
export type ParamRow = { key: string; value: string };

/** Ett utledet trinn (numerisk liste i designet). */
export type DrillStep = { n: number; text: string };

/** Ett medium tilgjengelig for media-veksleren. */
export type DrillMedia = {
  kind: "video" | "foto";
  label: string;
  url: string;
};

export type DrillDetaljData = {
  id: string;
  name: string;
  description: string | null;
  axis: Axis;
  axisLabel: string;
  /** Eyebrow: "SLAG · INNSPILL" — akse + ev. skill/område. */
  eyebrow: string;
  /** Kort drill-referanse til topbar, f.eks. "DRILL". */
  topbarTag: string;
  /** Meta-chips i hero (kun de med data). */
  meta: { icon: "clock" | "list" | "target" | "zap"; text: string }[];
  /** Beregnet CS-target for spillerens kategori (eller midtpunkt av spenn). */
  csForMeg: number | null;
  csMin: number | null;
  csMax: number | null;
  /** Tilgjengelige media (video/foto). Tom = vis placeholder. */
  media: DrillMedia[];
  /** Utledede trinn (fra prerequisites). Tom = skjul trinn-seksjon. */
  steps: DrillStep[];
  /** Parameter-tabell — kun rader med faktisk verdi. */
  params: ParamRow[];
  coachNotes: string | null;
};

/** Beregn CS-target for spillerens kategori, fall tilbake til spenn-midtpunkt. */
function beregnCs(
  csTargetByKategori: unknown,
  csMin: number | null,
  csMax: number | null,
  hcp: number | null,
): number | null {
  const kategori = kategoriFraHcp(hcp);
  if (
    kategori !== null &&
    csTargetByKategori &&
    typeof csTargetByKategori === "object" &&
    !Array.isArray(csTargetByKategori)
  ) {
    const map = csTargetByKategori as Record<string, unknown>;
    const v = map[kategori];
    if (typeof v === "number") return v;
  }
  if (csMin !== null && csMax !== null) return Math.round((csMin + csMax) / 2);
  if (csMax !== null) return csMax;
  if (csMin !== null) return csMin;
  return null;
}

function parseParams(json: unknown): DrillParameters | null {
  if (!json) return null;
  const result = DrillParametersSchema.safeParse(json);
  return result.success ? result.data : null;
}

/** Les miljø-label fra enten parametersJson (M-kode) eller environment[]. */
function miljoLabel(
  params: DrillParameters | null,
  environment: SessionEnvironment[],
): string | null {
  if (params?.modus === "GOLF" && params.environment) {
    const m = M_MILJO.find((x) => x.kode === params.environment);
    if (m) return m.label;
  }
  if (environment.length > 0) {
    return environment.map((e) => ENV_LABEL[e]).join(" · ");
  }
  return null;
}

/** Reps-tekst fra defaultReps/defaultSets eller defaultRepsSets-fritekst. */
function repsLabel(
  defaultReps: number | null,
  defaultSets: number | null,
  defaultRepsSets: string | null,
): string | null {
  if (defaultReps !== null && defaultSets !== null) {
    return `${defaultSets} × ${defaultReps}`;
  }
  if (defaultReps !== null) return `${defaultReps} reps`;
  if (defaultRepsSets && defaultRepsSets.trim()) return defaultRepsSets.trim();
  return null;
}

export async function loadDrillDetalj(
  id: string,
  user: { hcp: number | null },
): Promise<DrillDetaljData | null> {
  const drill = await prisma.exerciseDefinition.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      description: true,
      pyramidArea: true,
      skillArea: true,
      lPhase: true,
      durationMin: true,
      csMin: true,
      csMax: true,
      csTargetByKategori: true,
      defaultReps: true,
      defaultSets: true,
      defaultRepsSets: true,
      parametersJson: true,
      utstyr: true,
      environment: true,
      videoUrl: true,
      imageUrl: true,
      coachNotes: true,
      prerequisites: true,
    },
  });

  if (!drill) return null;

  const axis = AREA_TIL_AXIS[drill.pyramidArea];
  const params = parseParams(drill.parametersJson);

  // Eyebrow: akse + ev. skill-område eller treningsområde fra parametere.
  let eyebrowDetail: string | null = drill.skillArea
    ? SKILL_LABEL[drill.skillArea]
    : null;
  if (!eyebrowDetail && params?.modus === "GOLF" && params.treningsomrade) {
    const o = TRENINGSOMRADER.find((t) => t.kode === params.treningsomrade);
    if (o) eyebrowDetail = o.label;
  }
  const eyebrow = eyebrowDetail
    ? `${AXIS_LABEL[axis]} · ${eyebrowDetail}`
    : AXIS_LABEL[axis];

  // CS-target.
  const csForMeg = beregnCs(
    drill.csTargetByKategori,
    drill.csMin,
    drill.csMax,
    user.hcp,
  );

  // Media — kun det som faktisk finnes.
  const media: DrillMedia[] = [];
  if (drill.videoUrl) {
    media.push({ kind: "video", label: "Video", url: drill.videoUrl });
  }
  if (drill.imageUrl) {
    media.push({ kind: "foto", label: "Foto", url: drill.imageUrl });
  }

  // Trinn — utledet fra prerequisites (eneste strukturerte kilde). Ingen
  // fabrikerte ball-/kølle-instruksjoner: finnes ikke prerequisites, skjules
  // hele seksjonen.
  const steps: DrillStep[] = drill.prerequisites
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((text, i) => ({ n: i + 1, text }));

  // Parameter-tabell — kun rader med faktisk verdi.
  const params_table: ParamRow[] = [];
  const reps = repsLabel(
    drill.defaultReps,
    drill.defaultSets,
    drill.defaultRepsSets,
  );
  if (reps) params_table.push({ key: "Reps", value: reps });
  if (drill.durationMin !== null) {
    params_table.push({ key: "Tid", value: `${drill.durationMin} min` });
  }
  if (csForMeg !== null) {
    params_table.push({ key: "CS", value: String(csForMeg) });
  } else if (drill.csMin !== null || drill.csMax !== null) {
    params_table.push({
      key: "CS",
      value:
        drill.csMin !== null && drill.csMax !== null
          ? `${drill.csMin}–${drill.csMax}`
          : String(drill.csMax ?? drill.csMin),
    });
  }
  if (drill.utstyr.length > 0) {
    params_table.push({ key: "Kølle", value: drill.utstyr.join(" · ") });
  }
  const miljo = miljoLabel(params, drill.environment);
  if (miljo) params_table.push({ key: "Miljø", value: miljo });
  if (params?.modus === "GOLF" && params.lFase) {
    const l = L_FASER.find((x) => x.kode === params.lFase);
    if (l) params_table.push({ key: "L-fase", value: l.label });
  }

  // Hero-meta — kun chips med data.
  const meta: DrillDetaljData["meta"] = [];
  if (drill.durationMin !== null) {
    meta.push({ icon: "clock", text: `${drill.durationMin} min` });
  }
  if (steps.length > 0) {
    meta.push({ icon: "list", text: `${steps.length} trinn` });
  }
  if (csForMeg !== null) {
    meta.push({ icon: "target", text: `CS ${csForMeg}` });
  }

  return {
    id: drill.id,
    name: drill.name,
    description: drill.description,
    axis,
    axisLabel: AXIS_LABEL[axis],
    eyebrow,
    topbarTag: "DRILL",
    meta,
    csForMeg,
    csMin: drill.csMin,
    csMax: drill.csMax,
    media,
    steps,
    params: params_table,
    coachNotes: drill.coachNotes,
  };
}
