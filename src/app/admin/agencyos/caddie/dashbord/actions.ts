"use server";

/**
 * AgencyOS · Caddie · Dashbord (v2) — server actions.
 * Flyttet fra src/app/admin/(legacy)/agencyos/caddie/dashbord/actions.ts ved
 * v2-portering — samme logikk, revalidatePath peker på den nye v2-ruten.
 */

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { assertCapability } from "@/lib/auth/effective-capabilities";
import { Capability } from "@/lib/auth/cbac";
import { runCaddieProactive } from "@/lib/agents/caddie-proactive";
import {
  avvisCaddieDraft,
  godkjennOgUtforCaddieDraft,
} from "@/lib/caddie/draft-godkjenning";

// G6: AI-dispatch gates på USE_AGENTS i stedet for hardkodet ADMIN. USE_AGENTS
// er utenfor COACH-defaulten, så i praksis er dette fortsatt ADMIN — pluss
// trenere Anders eksplisitt har gitt GRANT use_agents.

/** Kjør den proaktive Caddie-agenten nå (manuell trigger). USE_AGENTS. */
export async function kjorCaddieProaktiv() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  await assertCapability(user, Capability.USE_AGENTS);
  const res = await runCaddieProactive();
  revalidatePath("/admin/agencyos/caddie/dashbord");
  return res;
}

/** Avvis et proaktivt forslag (PENDING → REJECTED). USE_AGENTS. */
export async function avvisProaktivtForslag(draftId: string) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  await assertCapability(user, Capability.USE_AGENTS);
  const res = await avvisCaddieDraft(draftId, user.id);
  revalidatePath("/admin/agencyos/caddie/dashbord");
  revalidatePath("/admin/godkjenninger");
  return { ok: res.ok };
}

/** A2: Godkjenn og UTFØR et Caddie-utkast fra A1-køen. Utførelsen
 *  re-validerer mot nå-tilstand (spiller finnes, faktura fortsatt ubetalt,
 *  time ikke dobbeltbooket). USE_AGENTS. */
export async function godkjennCaddieDraft(draftId: string) {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  await assertCapability(user, Capability.USE_AGENTS);
  const res = await godkjennOgUtforCaddieDraft(draftId, user.id);
  revalidatePath("/admin/agencyos/caddie/dashbord");
  revalidatePath("/admin/godkjenninger");
  return res;
}
