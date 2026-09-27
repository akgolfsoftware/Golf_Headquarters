import { TeamNorwayAppView } from "@/components/team-norway/app/TeamNorwayAppView";

export const metadata = {
  title: "Team Norway · Toppidrettsskoler & Testoversikt",
  description: "Nasjonal testoversikt for WANG Toppidrett og WANG Ung toppidrettsskoler.",
  robots: { index: false, follow: false },
};

/** TN-06: Toppidrettsskoler og nasjonal testoversikt */
export default function Page() {
  return <TeamNorwayAppView initialSkjerm="TN-06" />;
}
