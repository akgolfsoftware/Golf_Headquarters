/**
 * Feature-flags for plassholder-sider.
 *
 * Sider som er bygget men venter på data/funksjonalitet kan slås av via
 * miljøvariabler. Når flagget er av: sider returnerer 404 og sidebar-lenker
 * skjules. Sett til "true" i .env.local når du vil aktivere lokalt.
 *
 * Se docs/decisions-2026-05.md (H3) for beslutningsgrunnlag.
 */

export const FEATURES = {
  LEADERBOARD: process.env.NEXT_PUBLIC_FEATURE_LEADERBOARD === "true",
  TRACKMAN_DETAIL: process.env.NEXT_PUBLIC_FEATURE_TRACKMAN_DETAIL === "true",
  TALENT: process.env.NEXT_PUBLIC_FEATURE_TALENT === "true",
} as const;

export type FeatureName = keyof typeof FEATURES;

export function isFeatureOn(name: FeatureName): boolean {
  return FEATURES[name];
}
