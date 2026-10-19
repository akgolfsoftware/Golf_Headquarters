/**
 * Junior (/junior) i «AK Golf Precision Athletics». OFFENTLIG: ingen auth-guard.
 * Skallet (nav/bunn) eies av `(marketing)/layout.tsx`.
 */
import type { Metadata } from "next";

import { JuniorPrecision } from "@/components/marketing/ds-sider/JuniorPrecision";

export const metadata: Metadata = {
  title: "Junior · AK Golf Academy",
  description:
    "AK Golf Junior Academy tar spilleren fra første golfskole til turneringsspill, i fem trinn med navn: Mini, Knøtt, Basis, Utvikling og Elite.",
};

export default function JuniorPage() {
  return <JuniorPrecision />;
}
