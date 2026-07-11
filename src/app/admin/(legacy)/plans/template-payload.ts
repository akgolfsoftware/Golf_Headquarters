import type { PyramidArea } from "@/generated/prisma/client";

/**
 * Struktur som lagres i PlanTemplate.payload (Json).
 * Brukes til å forhåndsfylle plan-wizard (allokering, ukeSkjema, antall uker)
 * og rekonstruere økt-sekvens når en ny plan opprettes fra mal.
 */
export type PlanTemplatePayload = {
  weeks: number;
  allokering: {
    FYS: number;
    TEK: number;
    SLAG: number;
    SPILL: number;
    TURN: number;
  };
  ukeSkjema: {
    okterPerUke: number;
    varighetMin: number;
  };
  sessions: PlanTemplateSession[];
};

export type PlanTemplateSession = {
  week: number;
  day: number;
  title: string;
  pyramidArea: PyramidArea;
  durationMin: number;
  rationale: string | null;
  drills: PlanTemplateDrill[];
};

export type PlanTemplateDrill = {
  exerciseId: string;
  repsSets: string | null;
  csTarget: number | null;
  notes: string | null;
  orderIndex: number;
};
