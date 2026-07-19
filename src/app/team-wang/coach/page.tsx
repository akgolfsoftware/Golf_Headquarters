import type { Metadata } from "next";

import { CoachArsplan } from "./coach-arsplan";

// WANG Årsplan (Coach) – trenerverktøy-demo fra Claude Design. Hardkodet,
// ingen DB → bygg krever aldri database. Intern skjerm: noindex.
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "WANG Årsplan — Coach",
  description: "Trenerens periodiserte årsplan for golfgruppa ved WANG Toppidrett Fredrikstad.",
  robots: { index: false, follow: false },
};

export default function WangCoachPage() {
  return <CoachArsplan />;
}
