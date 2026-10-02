import { WeekPlanningDetailsSchema, type WeekPlanningDetails } from "./ukeplan-schema";

/** Bare validerte v1-tall/enumverdier overlever. Ingen fritekst videreføres. */
export function anonymiserUkeplandetaljer(value: unknown): WeekPlanningDetails | null {
  const parsed = WeekPlanningDetailsSchema.safeParse(value);
  if (!parsed.success) return null;
  const { weekType, areas } = parsed.data;
  const omrade = (area: WeekPlanningDetails["areas"]["FYS"]) => ({
    priority: area.priority, focus: null, sessionBudget: area.sessionBudget,
  });
  return {
    version: 1, weekType, location: null,
    areas: {
      FYS: omrade(areas.FYS), TEK: omrade(areas.TEK), SLAG: omrade(areas.SLAG),
      SPILL: omrade(areas.SPILL), TURN: omrade(areas.TURN),
    },
  };
}
