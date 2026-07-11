import { z } from "zod";
import type { PyramidArea, SgCategory, SkillArea } from "@/generated/prisma/client";

export const pyramidAreaSchema = z.enum(["FYS", "TEK", "SLAG", "SPILL", "TURN"]);
export const sgCategorySchema = z.enum(["OTT", "APP", "ARG", "PUTT"]);
export const skillAreaSchema = z.enum([
  "TEE_TOTAL",
  "TILNAERMING",
  "AROUND_GREEN",
  "PUTTING",
  "SPILL",
]);

export type PyramidDistribution = Record<PyramidArea, number>;

export const DEFAULT_PYRAMID_PERCENT: PyramidDistribution = {
  FYS: 15,
  TEK: 20,
  SLAG: 35,
  SPILL: 20,
  TURN: 10,
};

export const SG_TO_SKILL: Record<SgCategory, SkillArea> = {
  OTT: "TEE_TOTAL",
  APP: "TILNAERMING",
  ARG: "AROUND_GREEN",
  PUTT: "PUTTING",
};

export const SG_TO_PYRAMID: Record<SgCategory, PyramidArea> = {
  OTT: "SLAG",
  APP: "SLAG",
  ARG: "SPILL",
  PUTT: "SLAG",
};

export const LOW_RISK_ACTION_TYPES = new Set([
  "DRILL_SWAP",
  "REST_DAY_ADD",
  "INTENSITY_ADJUST",
  "TRAINING_GAP",
]);