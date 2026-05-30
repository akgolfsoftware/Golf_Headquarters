/**
 * V2 Hooks — living-app animasjons-hooks.
 *
 * Alle bruker scroll/resize-listeners (ikke IntersectionObserver) for å
 * fungere pålitelig i sandboxed iframes og prerender-kontekster.
 * Respekterer prefers-reduced-motion.
 */

export { useCountUp } from "./use-count-up";
export { useNowTime } from "./use-now-time";
export { useHeroParallax } from "./use-hero-parallax";
export { useInView } from "./use-in-view";

/**
 * Format a number with sign prefix.
 * "+0.3", "−1.4", "0"
 */
export function fmtSigned(n: number, decimals?: number): string {
  if (!isFinite(n)) return "0";
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  const abs = Math.abs(n).toFixed(decimals ?? (Math.abs(n) < 10 ? 1 : 0));
  return `${sign}${abs}`;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}
