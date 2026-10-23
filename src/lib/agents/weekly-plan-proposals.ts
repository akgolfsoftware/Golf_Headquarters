import "server-only";

/** The legacy batch used an unscoped player list and emitted proposals without
 * plan, recipient, sharing evidence or exercises. Do not let the cron route keep
 * producing those rows while the replacement is being qualified.
 *
 * New server orchestration lives in deling/ak-ukeforslag-generering. Activation
 * still requires a qualified planner, purpose coverage and the complete journey.
 * Throw before any read/model call/write; never report a disabled run as success.
 */
export async function runWeeklyPlanProposals(): Promise<never> {
  throw Error("Ukeforslagsjobben er ikke aktivert: faglig planlegging og formålsdekning gjenstår.");
}
