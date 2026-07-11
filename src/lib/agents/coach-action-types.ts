// Executable vs stub PlanAction-typer — én sannhetskilde for godkjenninger-kø.

/** PlanAction-typer som `plan-action-executor` faktisk kan utføre. */
export const EXECUTABLE_ACTION_TYPES = new Set([
  "PYRAMID_ADJUST",
  "TRAINING_GAP",
  "FOCUS_CHANGE",
  "DRILL_SWAP",
  "SESSION_ADD",
  "SESSION_REMOVE",
  "WEEK_SHIFT",
  "INTENSITY_ADJUST",
  "PERIOD_SWITCH",
  "REST_DAY_ADD",
]);

export function erExecutablePlanAction(actionType: string): boolean {
  return EXECUTABLE_ACTION_TYPES.has(actionType);
}