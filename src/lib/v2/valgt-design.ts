/** Anders 10.09.2026: ZIP (4) gjelder PlayerHQ og AgencyOS. */
export function trainLockVersjonForRute(path: string): "4" | undefined {
  return /^\/(portal|admin)(\/|$)/.test(path) ? "4" : undefined;
}
