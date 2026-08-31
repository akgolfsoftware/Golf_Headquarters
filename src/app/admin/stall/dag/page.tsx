/**
 * /admin/stall/dag → /admin/kalender?fane=stall (MASTERPLAN 15.4).
 *
 * Spillere-som-kolonner-flaten bor nå som «Stall-dag»-fanen på den samlede
 * kalenderadressen. `?dato=` bevares. Auth før redirect — samme mønster som
 * T7-redirectene i kalender-familien (/admin/bookinger, /admin/agencyos/uka).
 */

import { permanentRedirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{ dato?: string }>;
};

const ISO_DATO = /^\d{4}-\d{2}-\d{2}$/;

export default async function StallDagRedirect({ searchParams }: Props) {
  await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { dato } = await searchParams;
  const suffix = dato && ISO_DATO.test(dato) ? `&dato=${dato}` : "";
  permanentRedirect(`/admin/kalender?fane=stall${suffix}`);
}
