import { WangRekrutteringView } from "@/components/wang/WangRekrutteringView";

export const metadata = {
  title: "WANG Toppidrett · Rekruttering & Opptak",
  description: "Internskjerm for spillerrekruttering og talentopptak koblet med AK Golf Pipeline.",
  robots: { index: false, follow: false },
};

/** WANG Toppidrett & WANG Ung internskjerm for rekruttering og opptak */
export default function WangRekrutteringPage() {
  return <WangRekrutteringView />;
}
