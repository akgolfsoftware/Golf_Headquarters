import { csvShotsToCanonical, type CanonicalShot } from "@/lib/trackman/canonical";
import type { TrackManShot } from "@/lib/trackman/parse-csv";

/** Verdier som forhåndsvisningen viser: mph for fart og meter for avstand. */
export function trackManShotsForPreview(shots: TrackManShot[]): CanonicalShot[] {
  return csvShotsToCanonical(shots);
}
