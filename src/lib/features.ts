/**
 * Feature-flags for plassholder-sider.
 *
 * Sider som er bygget men venter på data/funksjonalitet kan slås av via
 * miljøvariabler. Når flagget er av: sider returnerer 404 og sidebar-lenker
 * skjules. Sett til "true" i .env.local når du vil aktivere lokalt.
 *
 * Se docs/decisions-2026-05.md (H3) for beslutningsgrunnlag.
 */

/**
 * Feature-flags for plassholder-sider.
 * Default ON (Anders 2026-07-22: alt synlig) med mindre eksplisitt "false".
 * Sett NEXT_PUBLIC_FEATURE_*=false for å skjule.
 */
function flagOn(env: string | undefined, defaultOn = true): boolean {
  if (env === "false" || env === "0") return false;
  if (env === "true" || env === "1") return true;
  return defaultOn;
}

export const FEATURES = {
  LEADERBOARD: flagOn(process.env.NEXT_PUBLIC_FEATURE_LEADERBOARD),
  TRACKMAN_DETAIL: flagOn(process.env.NEXT_PUBLIC_FEATURE_TRACKMAN_DETAIL),
  TALENT: flagOn(process.env.NEXT_PUBLIC_FEATURE_TALENT),
} as const;

export type FeatureName = keyof typeof FEATURES;

export function isFeatureOn(name: FeatureName): boolean {
  return FEATURES[name];
}
