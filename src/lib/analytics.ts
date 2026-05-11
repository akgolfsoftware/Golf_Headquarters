/**
 * Plausible-event-wrapper.
 *
 * Brukes på conversion-punkter:
 *   trackEvent("Signup Started")
 *   trackEvent("Booking Completed", { service: "Pro-time 60 min" })
 *
 * No-op hvis Plausible ikke er lastet (server-side, dev uten domain).
 */

type PlausibleProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: PlausibleProps }) => void;
  }
}

export function trackEvent(event: string, props?: PlausibleProps): void {
  if (typeof window === "undefined") return;
  if (typeof window.plausible !== "function") return;
  window.plausible(event, props ? { props } : undefined);
}
