"use server";

/**
 * AgencyOS · Caddie · Dashbord (v2) — server actions.
 * Flyttet fra src/app/admin/(legacy)/agencyos/caddie/dashbord/actions.ts ved
 * v2-portering — samme logikk, revalidatePath peker på den nye v2-ruten.
 */

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { runCaddieProactive } from "@/lib/agents/caddie-proactive";
import {
  avvisCaddieDraft,
  godkjennOgUtforCaddieDraft,
} from "@/lib/caddie/draft-godkjenning";

/** Kjør den proaktive Caddie-agenten nå (manuell trigger). ADMIN-only. */
export async function kjorCaddieProaktiv() {
  await requirePortalUser({ allow: ["ADMIN"] });
  const res = await runCaddieProactive();
  revalidatePath("/admin/agencyos/caddie/dashbord");
  return res;
}

/** Avvis et proaktivt forslag (PENDING → REJECTED). ADMIN-only. */
export async function avvisProaktivtForslag(draftId: string) {
  const user = await requirePortalUser({ allow: ["ADMIN"] });
  const res = await avvisCaddieDraft(draftId, user.id);
  revalidatePath("/admin/agencyos/caddie/dashbord");
  revalidatePath("/admin/godkjenninger");
  return { ok: res.ok };
}

/** A2: Godkjenn og UTFØR et Caddie-utkast fra A1-køen. Utførelsen
 *  re-validerer mot nå-tilstand (spiller finnes, faktura fortsatt ubetalt,
 *  time ikke dobbeltbooket). ADMIN-only. */
export async function godkjennCaddieDraft(draftId: string) {
  const user = await requirePortalUser({ allow: ["ADMIN"] });
  const res = await godkjennOgUtforCaddieDraft(draftId, user.id);
  revalidatePath("/admin/agencyos/caddie/dashbord");
  revalidatePath("/admin/godkjenninger");
  return res;
}
