/**
 * MARKEDSSIDE Slik trener vi (/treningsfilosofi, retning C). OFFENTLIG: ingen
 * auth-guard, egen marketing-chrome (MRamme), IKKE V2Shell.
 */
import type { Metadata } from "next";
import { MarkedTreningsfilosofiV2 } from "@/components/marketing/v2/MarkedTreningsfilosofiV2";

export const metadata: Metadata = {
  title: "Slik trener vi · AK Golf Academy",
  description:
    "Pyramide-systemet, data-drevet trening og individualiserte planer. Slik bygger AK Golf Academy spillere som får fremgang.",
};

export default function TreningsfilosofiPage() {
  return <MarkedTreningsfilosofiV2 />;
}
