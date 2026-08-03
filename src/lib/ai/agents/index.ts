// Eksporterer alle AI-agents fra ett sentralt punkt.
//
// Hver agent har sin egen system-prompt og chat-funksjon, men deler
// client/skills/memory. (Caddie bor i src/lib/caddie/ — ikke her.)

export { genererDailyBrief, DAILY_BRIEF_SYSTEM } from "./daily-brief";
export type { DailyBriefMetrics, DailyBriefResult } from "./daily-brief";

export { foreslaPlanRevisjon, PLAN_REVISION_SYSTEM } from "./plan-revision";
export type {
  PlanRevisionTrigger,
  PlanRevisionEndring,
  PlanRevisionForslag,
} from "./plan-revision";

export {
  identifiserInaktiveSpillere,
  VINN_TILBAKE_SYSTEM,
} from "./vinn-tilbake";
export type { InaktivSpillerForslag } from "./vinn-tilbake";

export { tolkSg, SG_INTERPRETATION_SYSTEM } from "./sg-interpretation";
export type {
  SgTrend,
  SgKategoriKode,
  SgKategoriTolkning,
  SgInterpretationResult,
} from "./sg-interpretation";

export {
  foreslaPeakingPlan,
  PERFORMANCE_PEAKING_SYSTEM,
} from "./performance-peaking";
export type {
  BompaFase,
  VolumNivaa,
  IntensitetNivaa,
  PyramidFokus,
  FaseUke,
  PeakingPlanResult,
} from "./performance-peaking";
