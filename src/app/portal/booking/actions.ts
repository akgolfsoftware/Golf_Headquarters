"use server";

/**
 * Server-action for v2-booking: re-henter slot-vindu når spilleren bytter
 * tjeneste (varighet påvirker hvilke tider som får plass). Auth kreves —
 * samme tilgang som selve booking-flaten.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { beregnSlotVindu, type SlotVindu } from "@/lib/portal-booking/slot-vindu";

export async function hentSlotVindu(tjenesteId: string): Promise<SlotVindu> {
  await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  return beregnSlotVindu(tjenesteId);
}
