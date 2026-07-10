/**
 * Marketing Kontakt (v2, retning C). Offentlig: ingen auth-guard (markedsflate).
 * Marketing har egen chrome (MRamme) i komponenten. Skjemaets server-action
 * ligger i ./actions.ts (flyttet 1:1 fra tidligere (mlegacy)/kontakt).
 */

import type { Metadata } from "next";
import { MarkedKontaktV2 } from "@/components/marketing/v2/MarkedKontaktV2";

export const metadata: Metadata = {
  title: "Kontakt AK Golf Academy",
  description:
    "Ta kontakt med AK Golf Academy. Personlig coaching, booking og spørsmål. Vi svarer innen 1 virkedag.",
};

export default function KontaktPage() {
  return <MarkedKontaktV2 />;
}
