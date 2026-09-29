import { redirect } from "next/navigation";

import { krevWangTrener } from "@/app/team-wang/_data/wang-trener-tilgang";
import { elevprofilHref } from "@/lib/wang/wang-ruter";

/**
 * WG-02 (IUP) utgår 28.09.2026. Den gamle adressen sender videre til IUP-fanen
 * i elevprofilen (WANG-44), som selv sjekker at eleven er i trenerens gruppe.
 */
export const dynamic = "force-dynamic";

export default async function IupPage({ params }: { params: Promise<{ elevId: string }> }) {
  await krevWangTrener();
  const { elevId } = await params;
  redirect(elevprofilHref(elevId, "iup"));
}
