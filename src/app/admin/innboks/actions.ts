"use server";

import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { acceptPlanAction, rejectPlanAction } from "@/lib/agents/actions";
import {
  avvisProaktivtForslag,
  godkjennCaddieDraft,
} from "@/app/admin/agencyos/caddie/dashbord/actions";
import {
  avslaaForespørsel,
  markerSomPlanlagt,
} from "@/app/admin/(legacy)/foresporsler/actions";
import { markerVarselLest } from "@/app/admin/varsler/actions";
import { godkjennSak, avvisSak } from "@/lib/saker/godkjenn";
import type { InnboksKilde } from "@/lib/admin/innboks-saker";

/** Marker en AppFeedback-rad (tilbakemelding/support) som sett. */
export async function markerAppFeedbackSett(id: string): Promise<{ ok: boolean }> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  await prisma.appFeedback.updateMany({
    where: { id, status: "NY" },
    data: { status: "SETT" },
  });
  revalidatePath("/admin/innboks");
  return { ok: true };
}

const KILDER: InnboksKilde[] = [
  "planAction",
  "caddieDraft",
  "sessionRequest",
  "notification",
  "appFeedback",
  "sak",
];

/**
 * Avgjør én sak i Innboks. Sak-id-en er «<kilde>:<rad-id>», og hver kilde
 * beholder sin egen eksisterende handling — denne funksjonen er kun ruteren,
 * slik at fasitens ene detaljpanel kan avgjøre alle fire saktypene uten at
 * klienten må kjenne fem forskjellige server actions.
 */
export async function avgjorInnboksSak(
  sakId: string,
  valg: "godkjenn" | "avvis",
  grunn?: string,
): Promise<{ ok: boolean; feil?: string }> {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const skille = sakId.indexOf(":");
  const kilde = skille > 0 ? sakId.slice(0, skille) : "";
  const id = skille > 0 ? sakId.slice(skille + 1) : "";
  if (!id || !KILDER.includes(kilde as InnboksKilde)) {
    return { ok: false, feil: "Ukjent sak." };
  }

  try {
    switch (kilde as InnboksKilde) {
      case "planAction":
        if (valg === "godkjenn") await acceptPlanAction(id);
        else await rejectPlanAction(id, grunn?.trim() || undefined);
        break;
      case "caddieDraft":
        if (valg === "godkjenn") await godkjennCaddieDraft(id);
        else await avvisProaktivtForslag(id);
        break;
      case "sessionRequest":
        if (valg === "godkjenn") await markerSomPlanlagt(id);
        else await avslaaForespørsel(id);
        break;
      case "notification":
        await markerVarselLest(id);
        break;
      case "appFeedback":
        await markerAppFeedbackSett(id);
        break;
      case "sak": {
        // Sak-radene er Anders' egen Gmail/SMS/iMessage-triage-kø, ikke
        // spillerdata (jf. loaderens ADMIN-filter i innboks-saker.ts) — en
        // coach skal ikke kunne godkjenne/avvise dem selv med en gjettet id.
        if (user.role !== "ADMIN") {
          return { ok: false, feil: "Kun ADMIN kan avgjøre denne saken." };
        }
        const res = valg === "godkjenn" ? await godkjennSak(id) : await avvisSak(id);
        if (!res.ok) {
          return { ok: false, feil: res.feil ?? "Handlingen gikk ikke gjennom." };
        }
        break;
      }
    }
  } catch (e) {
    // Kilder med strengere tilgang enn innboksen (Caddie-utkast krever ADMIN)
    // skal si fra i klartekst, ikke krasje skjermen.
    return {
      ok: false,
      feil: e instanceof Error && e.message ? e.message : "Handlingen gikk ikke gjennom.",
    };
  }

  revalidatePath("/admin/innboks");
  return { ok: true };
}
