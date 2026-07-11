/**
 * MARKEDSSIDE Junior (/junior, retning C). OFFENTLIG: ingen auth-guard, egen
 * marketing-chrome (MRamme), IKKE V2Shell.
 */
import type { Metadata } from "next";
import { MarkedJuniorV2 } from "@/components/marketing/v2/MarkedJuniorV2";

export const metadata: Metadata = {
  title: "Junior · AK Golf Academy",
  description:
    "Golf for unge talenter. AK Golf Academy tilbyr strukturert juniortrening for U10, U14, U18 og Talent-gruppen.",
};

export default function JuniorPage() {
  return <MarkedJuniorV2 />;
}
