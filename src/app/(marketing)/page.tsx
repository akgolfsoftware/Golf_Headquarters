/**
 * Marketing Forside (akgolf.no). OFFENTLIG flate: ingen auth-guard, ingen
 * dataloader (dette er markedsføringssiden, ikke en datadrevet app-skjerm).
 *
 * Siden 2026-08-28 (Anders): «Reisen» — scroll-drevet, 3D-animert forside
 * med de ekte Academy-bildene (MarkedForsideReise). Copy og palett er
 * videreført fra ak-golf-website-porten (lys Paper, ekte foto); bevegelsen
 * er bygget uten nye avhengigheter. Skallet (nav/footer) eies fortsatt av
 * `(marketing)/layout.tsx`; denne siden tegner aldri eget chrome.
 * MarkedForside (statisk forgjenger) beholdes til reisen er signert.
 */

import { MarkedForsideReise } from "@/components/marketing/paper/MarkedForsideReise";

export default function MarketingHjemPage() {
  return <MarkedForsideReise />;
}
