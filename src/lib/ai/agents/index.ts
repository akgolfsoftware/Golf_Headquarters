// Eksporterer alle AI-agents fra ett sentralt punkt.
//
// Nye agents legges til her etter mønsteret fra caddie. Hver agent har sin
// egen system-prompt og chat-funksjon, men deler client/skills/tools/memory.

export { chatCaddie, CADDIE_SYSTEM_PROMPT } from "./caddie";
export type { CaddieMessage, ChatCaddieOpts, ChatCaddieResult, ToolCallLog } from "./caddie";

export { chatCaddieMedSpiller } from "./caddie-with-spiller";
export type { ChatCaddieMedSpillerOpts } from "./caddie-with-spiller";

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
