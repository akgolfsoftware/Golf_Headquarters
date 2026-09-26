/**
 * Team Norway · Landslagsoversikt (TN-01).
 * Designreferanse: Claude Design «Team Norway App» (3416f258-avledet).
 * Farger: Navy #012B5D, Rød #D70232 (kun aktiv fane/frist), Bakgrunn #F2F7FC.
 * Typografi: Jost overskrifter, Lato brødtekst, IBM Plex Mono tall.
 */


import { TeamNorwayAppView } from "@/components/team-norway/app/TeamNorwayAppView";

export const metadata = {
  title: "Team Norway Golf · Landslagsoversikt",
  description: "Offisielt dashbord for Norges Golfforbund / Team Norway Golf.",
};

export default function TeamNorwayPage() {
  return <TeamNorwayAppView initialSkjerm="TN-01" />;
}
