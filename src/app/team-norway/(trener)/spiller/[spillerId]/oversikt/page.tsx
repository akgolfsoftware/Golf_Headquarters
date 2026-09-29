import { redirect } from "next/navigation";

import { tnSpillerHref } from "@/components/team-norway/tn-ruter";
import { krevTnTrenerflate } from "@/lib/domain/tn-flate-tilgang";

/** Gammel adresse for spillerens oversikt. Profilen (TN-02) ligger nå på /team-norway/spiller/[spillerId]. */
export default async function SpillerOversiktPage({ params }: { params: Promise<{ spillerId: string }> }) {
  await krevTnTrenerflate();
  const { spillerId } = await params;
  redirect(tnSpillerHref(spillerId));
}
