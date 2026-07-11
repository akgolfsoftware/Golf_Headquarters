/**
 * MARKEDSSIDE Coaching (/coaching, retning C). OFFENTLIG: ingen auth-guard,
 * egen marketing-chrome (MRamme), IKKE V2Shell. Rendrer MarkedCoachingV2 1:1
 * mot mockup-fasit ui_kits/v2/marketing.jsx.
 */
import type { Metadata } from "next";
import { MarkedCoachingV2 } from "@/components/marketing/v2/MarkedCoachingV2";

export const metadata: Metadata = {
  title: "Coaching · AK Golf Academy",
  description:
    "Coaching som gir fremgang. Som abonnent får du 2 eller 4 coaching-timer hver måned, med plan, statistikk og oppfølging i PlayerHQ.",
};

export default function CoachingPage() {
  return <MarkedCoachingV2 />;
}
