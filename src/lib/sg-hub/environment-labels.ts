import type { TrackManEnvironment } from "@/generated/prisma/client";

export const ENVIRONMENT_LABELS: Record<TrackManEnvironment, string> = {
  SIMULATOR_INDOOR: "Simulator (innendørs)",
  NET_INDOOR: "Net innendørs",
  RANGE_OUTDOOR_MAT: "Driving range (matte)",
  RANGE_OUTDOOR_GRASS: "Driving range (gress)",
  COURSE_PRACTICE: "Bane (øving)",
  COURSE_COMPETITION: "Bane (konkurranse)",
};

export const ENVIRONMENT_OPTIONS = Object.entries(ENVIRONMENT_LABELS) as [
  TrackManEnvironment,
  string,
][];
