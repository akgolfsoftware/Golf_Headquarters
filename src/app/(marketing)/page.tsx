/**
 * Marketing Forside (akgolf.no). OFFENTLIG flate: ingen auth-guard, ingen
 * dataloader (dette er markedsføringssiden, ikke en datadrevet app-skjerm).
 *
 * Designfasit siden 20.08.2026: `ak-golf-website` — lys Paper, ekte
 * Academy-foto, hero med motion-loop. Skallet (nav/footer) eies av
 * `(marketing)/layout.tsx`; denne siden tegner aldri eget chrome.
 * Erstattet MarkedForsideV2, som var mørk og hadde sin egen MNav/MFot.
 */

import { MarkedForside } from "@/components/marketing/paper/MarkedForside";

export default function MarketingHjemPage() {
  return <MarkedForside />;
}
