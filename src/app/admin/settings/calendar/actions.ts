"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import {
  setupWatchForSubscription,
  stopWatchForSubscription,
  syncCalendarList,
} from "@/lib/google-calendar";

export async function disconnectGoogleCalendar() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  // Stopp alle watch-kanaler først (best-effort)
  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId: user.id },
    include: { subscriptions: { where: { watchChannelId: { not: null } } } },
  });
  if (conn) {
    await Promise.allSettled(
      conn.subscriptions.map((s) => stopWatchForSubscription(s.id)),
    );
  }

  await prisma.googleCalendarConnection.deleteMany({
    where: { userId: user.id },
  });

  await audit({
    actorId: user.id,
    action: "google-calendar.disconnect",
    target: `User:${user.id}`,
  });

  revalidatePath("/admin/settings/calendar");
}

const oppdaterInputSchema = z.array(
  z.object({
    id: z.string().min(1),
    syncPush: z.boolean(),
    syncPull: z.boolean(),
    active: z.boolean(),
  }),
);

export type OppdaterSubscriptionInput = z.infer<typeof oppdaterInputSchema>;

/**
 * Oppdater push/pull/active for et sett med subscriptions.
 * Setter også opp watch (hvis pull går fra false → true) eller stopper
 * watch (hvis pull går fra true → false eller active går til false).
 */
export async function oppdaterSubscriptions(input: OppdaterSubscriptionInput) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const parsed = oppdaterInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false as const, error: "Ugyldig input" };
  }

  // Hent connection + nåværende subs for å verifisere eierskap
  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId: user.id },
    include: { subscriptions: true },
  });
  if (!conn) {
    return { ok: false as const, error: "Ingen Google-tilkobling" };
  }
  const eideIds = new Set(conn.subscriptions.map((s) => s.id));
  for (const item of parsed.data) {
    if (!eideIds.has(item.id)) {
      return { ok: false as const, error: "Forsøkte å endre subscription du ikke eier" };
    }
  }

  // For hver endret sub: oppdater + håndter watch
  let oppdatert = 0;
  for (const item of parsed.data) {
    const naa = conn.subscriptions.find((s) => s.id === item.id);
    if (!naa) continue;

    const skalHaWatch = item.syncPull && item.active;
    const harWatch = !!naa.watchChannelId;

    await prisma.googleCalendarSubscription.update({
      where: { id: item.id },
      data: {
        syncPush: item.syncPush,
        syncPull: item.syncPull,
        active: item.active,
      },
    });
    oppdatert++;

    // Watch-håndtering — best-effort, feiler ikke handlingen
    try {
      if (skalHaWatch && !harWatch) {
        await setupWatchForSubscription(item.id);
      } else if (!skalHaWatch && harWatch) {
        await stopWatchForSubscription(item.id);
      }
    } catch (err) {
      console.error("[oppdaterSubscriptions] watch-håndtering feilet", err);
    }
  }

  await audit({
    actorId: user.id,
    action: "google-calendar.subscriptions.updated",
    target: `GoogleCalendarConnection:${conn.id}`,
    metadata: { antall: oppdatert },
  });

  revalidatePath("/admin/settings/calendar");
  return { ok: true as const, oppdatert };
}

/**
 * Re-hent kalender-listen fra Google og oppdater subscriptions.
 * Brukes hvis brukeren har lagt til/fjernet en kalender i Google.
 */
export async function refreshCalendarList() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const conn = await prisma.googleCalendarConnection.findUnique({
    where: { userId: user.id },
  });
  if (!conn) {
    return { ok: false as const, error: "Ingen Google-tilkobling" };
  }

  try {
    const result = await syncCalendarList(conn.id);
    await audit({
      actorId: user.id,
      action: "google-calendar.list.refreshed",
      target: `GoogleCalendarConnection:${conn.id}`,
      metadata: { found: result.found, upserted: result.upserted, skipped: result.skipped },
    });
    revalidatePath("/admin/settings/calendar");
    return { ok: true as const, ...result };
  } catch (err) {
    const melding = err instanceof Error ? err.message : "ukjent";
    return { ok: false as const, error: melding };
  }
}
