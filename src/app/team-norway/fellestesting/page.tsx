/**
 * Team Norway · Fellestesting & Protokoller (TN-03).
 * Designreferanse: Claude Design «Team Norway App» (3416f258-avledet).
 */


import { TeamNorwayAppView } from "@/components/team-norway/app/TeamNorwayAppView";

export const metadata = {
  title: "Fellestesting · Team Norway Golf",
  description: "Nasjonale benchmark-tester og testprotokoller for landslagsutøvere.",
};

export default function TeamNorwayFellestestingPage() {
  return <TeamNorwayAppView initialSkjerm="TN-03" />;
}
