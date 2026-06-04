import type { SgCategory } from "@/generated/prisma/client";

export const SG_AREA_LABEL: Record<SgCategory, string> = {
  OTT: "Off the tee",
  APP: "Approach",
  ARG: "Around green",
  PUTT: "Putting",
};
