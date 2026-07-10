/**
 * MARKEDSSIDE Suksesshistorier (/suksess, retning C). OFFENTLIG: ingen
 * auth-guard, egen marketing-chrome (MRamme), IKKE V2Shell.
 */
import type { Metadata } from "next";
import { MarkedSuksessV2 } from "@/components/marketing/v2/MarkedSuksessV2";

export const metadata: Metadata = {
  title: "Suksesshistorier · AK Golf Academy",
  description:
    "Reelle resultater fra spillere som har trent hos AK Golf Academy, fra førsteslag til turneringsspill.",
};

export default function SuksessPage() {
  return <MarkedSuksessV2 />;
}
