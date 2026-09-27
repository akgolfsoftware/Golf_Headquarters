/**
 * Team Norway · Uttak & Kriterier (TN-05).
 * Designreferanse: Claude Design «Team Norway App» (3416f258-avledet).
 */


import { TeamNorwayAppView } from "@/components/team-norway/app/TeamNorwayAppView";

export const metadata = {
  title: "Uttak & Kriterier · Team Norway Golf",
  description: "Uttakskriterier for EM og VM samt offisiell WAGR-rangliste.",
};

export default function TeamNorwayUttakPage() {
  return <TeamNorwayAppView initialSkjerm="TN-05" />;
}
