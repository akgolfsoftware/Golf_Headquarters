import { redirect } from "next/navigation";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { elevprofilHref } from "@/lib/wang/wang-ruter";

/**
 * Den gamle turneringssiden per elev sender videre til Turneringer-fanen i
 * elevprofilen (WANG-44). Samme datamodul (`hentTurneringshistorikk`) brukes der.
 */
export const dynamic = "force-dynamic";

export default async function WangTurneringerPage({ params }: { params: Promise<{ elevId: string }> }) {
  await krevWangTrener();
  const { elevId } = await params;
  redirect(elevprofilHref(elevId, "turneringer"));
}
