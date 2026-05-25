/**
 * Coach Workbench — Foundation-komponenter (Spor A i Sprint 2).
 *
 * Pure presentational. Data sendes som props fra koordinator.
 */

export {
  CoachWorkbenchTopBar,
  type CoachWorkbenchTopBarProps,
  type CoachWorkbenchModus,
  type CoachWorkbenchSpiller,
  type CoachWorkbenchGruppe,
} from "./top-bar";

export {
  CoachSpillerHero,
  type CoachSpillerHeroProps,
} from "./spiller-hero";

export {
  CoachKeyMetrics,
  type CoachKeyMetricsProps,
  type SgTrend,
} from "./key-metrics";

export { CoachTabs, type CoachTab, type CoachTabsProps } from "./tabs";

export {
  CoachWorkbenchShell,
  type CoachWorkbenchShellProps,
} from "./shell";
