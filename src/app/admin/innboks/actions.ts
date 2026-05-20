"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

export type InboxItemKind = "approval" | "message" | "follow_up";

export type InboxActionResult =
  | { ok: true; count: number }
  | { ok: false; feil: string };

async function assertCoach() {
  const user = await getCurrentUser();
  if (!user) return { ok: false as const, feil: "unauthenticated" };
  if (user.role !== "COACH" && user.role !== "ADMIN") {
    return { ok: false as const, feil: "forbidden" };
  }
  return { ok: true as const, user };
}

/**
 * Marker ett innboks-item som "behandlet". Effekten avhenger av type:
 * - approval: setter PlanAction.status = ACCEPTED (samme som /admin/approvals).
 * - message:  oppdaterer CoachingSession.updatedAt slik at coach-view ikke
 *             flagger ulest lengre — den ekte "lest"-statusen er avledet
 *             fra siste meldings rolle, så vi legger til en tom coach-respons.
 * - follow_up: PlanAction lar oss spore at coach har sett saken — vi lager
 *             en placeholder PlanAction med actionType=FOLLOW_UP_DISMISS.
 */
export async function markInboxItemDone(
  kind: InboxItemKind,
  itemId: string,
): Promise<InboxActionResult> {
  const auth = await assertCoach();
  if (!auth.ok) return auth;
  if (!itemId) return { ok: false, feil: "Mangler item-id." };

  try {
    if (kind === "approval") {
      await prisma.planAction.update({
        where: { id: itemId },
        data: { status: "ACCEPTED" },
      });
    } else if (kind === "message") {
      // "Marker som behandlet" på en melding = legg til en tom coach-respons
      // slik at "ulest"-flagget (siste rolle = user) forsvinner.
      const tråd = await prisma.coachingSession.findUnique({
        where: { id: itemId },
        select: { messages: true },
      });
      if (!tråd) return { ok: false, feil: "Melding ikke funnet." };
      const meldinger = Array.isArray(tråd.messages) ? tråd.messages : [];
      await prisma.coachingSession.update({
        where: { id: itemId },
        data: {
          messages: [
            ...meldinger,
            {
              role: "coach",
              content: "✓ Behandlet",
              ts: new Date().toISOString(),
            },
          ],
          updatedAt: new Date(),
        },
      });
    } else if (kind === "follow_up") {
      // Spilleren har en aktiv oppfølgings-sak — vi lar coach dismisse den
      // ved å logge en PlanAction. Dette er en lett markør, ikke en full
      // status-endring på spilleren.
      await prisma.planAction.create({
        data: {
          userId: itemId,
          actionType: "FOLLOW_UP_DISMISS",
          suggestion: { dismissedAt: new Date().toISOString() },
          status: "ACCEPTED",
          agentName: "coach",
        },
      });
    } else {
      return { ok: false, feil: "Ukjent innboks-type." };
    }
  } catch (err) {
    console.error("[innboks] markInboxItemDone feilet", err);
    return { ok: false, feil: "Kunne ikke markere som behandlet." };
  }

  revalidatePath("/admin/innboks");
  return { ok: true, count: 1 };
}

/**
 * Bulk: marker en serie items som lest/behandlet. Items er tuples [kind, id]
 * slik at vi kan blande typer i én call (typisk fra "Marker alle som lest").
 */
export async function markInboxItemsRead(
  items: { kind: InboxItemKind; id: string }[],
): Promise<InboxActionResult> {
  const auth = await assertCoach();
  if (!auth.ok) return auth;
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, feil: "Ingen items valgt." };
  }
  if (items.length > 200) {
    return { ok: false, feil: "For mange items (maks 200)." };
  }

  let count = 0;
  for (const { kind, id } of items) {
    const res = await markInboxItemDone(kind, id);
    if (res.ok) count += res.count;
  }

  revalidatePath("/admin/innboks");
  return { ok: true, count };
}
