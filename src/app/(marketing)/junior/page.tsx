/**
 * MARKEDSSIDE Junior (/junior). OFFENTLIG: ingen auth-guard.
 * Skallet (nav/bunn) eies av `(marketing)/layout.tsx` — siden tegner aldri
 * eget chrome. Master AK Golf, MASTERPLAN 18.33 runde 2.
 */
import type { Metadata } from "next";

import { JuniorAK } from "@/components/marketing/ak-sider/JuniorAK";

export const metadata: Metadata = {
  title: "Junior · AK Golf Academy",
  description:
    "AK Golf Junior Academy tar spilleren fra første golfskole til turneringsspill, i fem trinn med navn: Mini, Knøtt, Basis, Utvikling og Elite.",
};

export default function JuniorPage() {
  return <JuniorAK />;
}
