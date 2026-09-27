export type SkillMapZoneId =
  | "TEE_TOTAL"
  | "INNSPILL_200"
  | "INNSPILL_150"
  | "INNSPILL_100"
  | "INNSPILL_50"
  | "CHIP"
  | "PITCH"
  | "LOB"
  | "BUNKER"
  | "PUTT_0_3"
  | "PUTT_3_5"
  | "PUTT_5_10"
  | "PUTT_10_25"
  | "PUTT_25_40"
  | "PUTT_40_PLUSS";

export type SkillMapFamily = "fullsving" | "naerspill" | "putting";

export type SkillMapTrainingBucket = "TEE_TOTAL" | "TILNAERMING" | "AROUND_GREEN" | "PUTTING";

export type SkillMapRound = {
  playedAt: Date;
  sgTee: number | null;
  sgApp200: number | null;
  sgApp150: number | null;
  sgApp100: number | null;
  sgApp50: number | null;
  sgChip: number | null;
  sgPitch: number | null;
  sgLob: number | null;
  sgBunker: number | null;
  sgPutt0_3: number | null;
  sgPutt3_5: number | null;
  sgPutt5_10: number | null;
  sgPutt10_15: number | null;
  sgPutt15_25: number | null;
  sgPutt25_40: number | null;
  sgPutt40plus: number | null;
};

export type SkillMapTraining = {
  skillArea: string | null;
  durationMin: number;
};

export type SkillMapZone = {
  id: SkillMapZoneId;
  label: string;
  shortLabel: string;
  family: SkillMapFamily;
  bucket: SkillMapTrainingBucket;
  distance: string;
  sg: number | null;
  trend: number[];
  valueCount: number;
  roundWindowCount: number;
  trainingSessions: number;
  trainingMinutes: number;
  dataStatus: "mangler" | "tynt" | "klart";
  insight: string;
  coachAction: string;
};

export type SkillMapSummary = {
  roundWindowCount: number;
  roundWindowLabel: string;
  strongestZoneId: SkillMapZoneId | null;
  weakestZoneId: SkillMapZoneId | null;
};

export type SkillMapData = {
  zones: SkillMapZone[];
  summary: SkillMapSummary;
};

type ZoneDefinition = {
  id: SkillMapZoneId;
  label: string;
  shortLabel: string;
  family: SkillMapFamily;
  bucket: SkillMapTrainingBucket;
  distance: string;
  values: (round: SkillMapRound) => Array<number | null>;
};

const ZONES: ZoneDefinition[] = [
  {
    id: "TEE_TOTAL",
    label: "Tee total",
    shortLabel: "Tee",
    family: "fullsving",
    bucket: "TEE_TOTAL",
    distance: ">205 m",
    values: (r) => [r.sgTee],
  },
  {
    id: "INNSPILL_200",
    label: "Innspill 200",
    shortLabel: "200",
    family: "fullsving",
    bucket: "TILNAERMING",
    distance: "175-225 m",
    values: (r) => [r.sgApp200],
  },
  {
    id: "INNSPILL_150",
    label: "Innspill 150",
    shortLabel: "150",
    family: "fullsving",
    bucket: "TILNAERMING",
    distance: "125-175 m",
    values: (r) => [r.sgApp150],
  },
  {
    id: "INNSPILL_100",
    label: "Innspill 100",
    shortLabel: "100",
    family: "fullsving",
    bucket: "TILNAERMING",
    distance: "75-125 m",
    values: (r) => [r.sgApp100],
  },
  {
    id: "INNSPILL_50",
    label: "Innspill 50",
    shortLabel: "50",
    family: "fullsving",
    bucket: "TILNAERMING",
    distance: "30-75 m",
    values: (r) => [r.sgApp50],
  },
  {
    id: "CHIP",
    label: "Chip",
    shortLabel: "Chip",
    family: "naerspill",
    bucket: "AROUND_GREEN",
    distance: "rundt green",
    values: (r) => [r.sgChip],
  },
  {
    id: "PITCH",
    label: "Pitch",
    shortLabel: "Pitch",
    family: "naerspill",
    bucket: "AROUND_GREEN",
    distance: "rundt green",
    values: (r) => [r.sgPitch],
  },
  {
    id: "LOB",
    label: "Lob",
    shortLabel: "Lob",
    family: "naerspill",
    bucket: "AROUND_GREEN",
    distance: "rundt green",
    values: (r) => [r.sgLob],
  },
  {
    id: "BUNKER",
    label: "Bunker",
    shortLabel: "Bunker",
    family: "naerspill",
    bucket: "AROUND_GREEN",
    distance: "sand",
    values: (r) => [r.sgBunker],
  },
  {
    id: "PUTT_0_3",
    label: "Kortputt 0-3 fot",
    shortLabel: "0-3",
    family: "putting",
    bucket: "PUTTING",
    distance: "0-3 ft",
    values: (r) => [r.sgPutt0_3],
  },
  {
    id: "PUTT_3_5",
    label: "Putt 3-5 fot",
    shortLabel: "3-5",
    family: "putting",
    bucket: "PUTTING",
    distance: "3-5 ft",
    values: (r) => [r.sgPutt3_5],
  },
  {
    id: "PUTT_5_10",
    label: "Putt 5-10 fot",
    shortLabel: "5-10",
    family: "putting",
    bucket: "PUTTING",
    distance: "5-10 ft",
    values: (r) => [r.sgPutt5_10],
  },
  {
    id: "PUTT_10_25",
    label: "Mellomputt 10-25 fot",
    shortLabel: "10-25",
    family: "putting",
    bucket: "PUTTING",
    distance: "10-25 ft",
    values: (r) => [r.sgPutt10_15, r.sgPutt15_25],
  },
  {
    id: "PUTT_25_40",
    label: "Langputt 25-40 fot",
    shortLabel: "25-40",
    family: "putting",
    bucket: "PUTTING",
    distance: "25-40 ft",
    values: (r) => [r.sgPutt25_40],
  },
  {
    id: "PUTT_40_PLUSS",
    label: "Lengdeputt 40+ fot",
    shortLabel: "40+",
    family: "putting",
    bucket: "PUTTING",
    distance: ">40 ft",
    values: (r) => [r.sgPutt40plus],
  },
];

const round2 = (value: number) => Math.round(value * 100) / 100;

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return round2(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function trendFromRounds(rounds: SkillMapRound[], definition: ZoneDefinition): number[] {
  return rounds
    .slice()
    .sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime())
    .reverse()
    .map((round) => average(definition.values(round).filter((v): v is number => v != null)))
    .filter((v): v is number => v != null);
}

function trainingByBucket(training: SkillMapTraining[]): Record<SkillMapTrainingBucket, { sessions: number; minutes: number }> {
  const out: Record<SkillMapTrainingBucket, { sessions: number; minutes: number }> = {
    TEE_TOTAL: { sessions: 0, minutes: 0 },
    TILNAERMING: { sessions: 0, minutes: 0 },
    AROUND_GREEN: { sessions: 0, minutes: 0 },
    PUTTING: { sessions: 0, minutes: 0 },
  };

  for (const session of training) {
    if (session.skillArea === "TEE_TOTAL" || session.skillArea === "TILNAERMING" || session.skillArea === "AROUND_GREEN" || session.skillArea === "PUTTING") {
      out[session.skillArea].sessions += 1;
      out[session.skillArea].minutes += session.durationMin;
    }
  }

  return out;
}

function dataStatus(valueCount: number): SkillMapZone["dataStatus"] {
  if (valueCount === 0) return "mangler";
  if (valueCount < 8) return "tynt";
  return "klart";
}

function insightFor(definition: ZoneDefinition, sg: number | null, status: SkillMapZone["dataStatus"]): string {
  if (status === "mangler") {
    return "Mangler registrerte SG-tall for dette området.";
  }
  if (status === "tynt") {
    return "Tallene er innledende og bør tolkes rolig.";
  }
  if (sg != null && sg < -0.3) {
    return `${definition.label} er et mulig tapsområde i siste rundegrunnlag.`;
  }
  if (sg != null && sg > 0.3) {
    return `${definition.label} ser ut som en styrke i siste rundegrunnlag.`;
  }
  return `${definition.label} ligger nær spillerens registrerte normal.`;
}

function coachActionFor(status: SkillMapZone["dataStatus"], sg: number | null): string {
  if (status === "mangler") return "Registrer flere runder før området brukes til planvalg.";
  if (status === "tynt") return "Bruk som samtalestarter, ikke som diagnose.";
  if (sg != null && sg < -0.3) return "Coach bør vurdere øvelse eller test før planendring.";
  return "Behold i analysebildet og følg utviklingen over tid.";
}

export function buildSkillMapData(rounds: SkillMapRound[], training: SkillMapTraining[]): SkillMapData {
  const trainingBuckets = trainingByBucket(training);

  const zones: SkillMapZone[] = ZONES.map((definition) => {
    const trend = trendFromRounds(rounds, definition);
    const sg = average(trend);
    const bucket = trainingBuckets[definition.bucket];
    const status = dataStatus(trend.length);

    return {
      id: definition.id,
      label: definition.label,
      shortLabel: definition.shortLabel,
      family: definition.family,
      bucket: definition.bucket,
      distance: definition.distance,
      sg,
      trend,
      valueCount: trend.length,
      roundWindowCount: rounds.length,
      trainingSessions: bucket.sessions,
      trainingMinutes: bucket.minutes,
      dataStatus: status,
      insight: insightFor(definition, sg, status),
      coachAction: coachActionFor(status, sg),
    };
  });

  const zonesWithSg = zones.filter((zone): zone is SkillMapZone & { sg: number } => zone.sg != null);
  const strongest = zonesWithSg.length > 0 ? [...zonesWithSg].sort((a, b) => b.sg - a.sg)[0] : null;
  const weakest = zonesWithSg.length > 0 ? [...zonesWithSg].sort((a, b) => a.sg - b.sg)[0] : null;

  return {
    zones,
    summary: {
      roundWindowCount: rounds.length,
      roundWindowLabel: rounds.length === 1 ? "1 runde" : `${rounds.length} runder`,
      strongestZoneId: strongest?.id ?? null,
      weakestZoneId: weakest?.id ?? null,
    },
  };
}
