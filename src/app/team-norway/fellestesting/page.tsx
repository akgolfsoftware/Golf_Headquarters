/**
 * Team Norway · Fellestesting & Protokoller (TN-03).
 * Designreferanse: Claude Design «Team Norway App» (3416f258-avledet).
 */

import { TnRegistrertSkjerm } from "@/components/team-norway/tn-registrerte-skjermer";

export const metadata = {
  title: "Fellestesting · Team Norway Golf",
  description: "Nasjonale benchmark-tester og testprotokoller for landslagsutøvere.",
};

/** TN-03. Fasit: designsystem/team-norway/templates/tn-fellestesting/TnFellestesting.dc.html */
export default async function Page({ searchParams }: { searchParams: Promise<{ dag?: string }> }) {
  const { dag } = await searchParams;
  return <TnRegistrertSkjerm skjerm="fellestesting" dagId={dag} />;
}
