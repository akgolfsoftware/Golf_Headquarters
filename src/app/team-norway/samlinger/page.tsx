/**
 * Team Norway · Samlinger & Månedsplan (TN-04).
 * Designreferanse: Claude Design «Team Norway App» (3416f258-avledet).
 */


import { TeamNorwayAppView } from "@/components/team-norway/app/TeamNorwayAppView";

export const metadata = {
  title: "Samlinger & Månedsplan · Team Norway Golf",
  description: "Årshjul, dagsprogram og pakkelister for Team Norway landslagssamlinger.",
};

export default function TeamNorwaySamlingerPage() {
  return <TeamNorwayAppView initialSkjerm="TN-04" />;
}
