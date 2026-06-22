"use server";

/**
 * Server-actions for økt-detalj (coach-context) på /admin/gjennomfore/okter/[id].
 *
 * Økten lastes som en Booking. Eneste handling som bygges her er kansellering —
 * resten av knappene på skjermen er ekte lenker eller flagg (handlingen bor ikke
 * her ennå). Se page.tsx for begrunnelse per knapp.
 *
 * Forskjell fra bookinger/actions.ts (avvisBooking): den gjelder KUN PENDING
 * (avvis et svar). Her kan coach avlyse en allerede BEKREFTET økt også, så
 * status-guarden dekker PENDING ELLER CONFIRMED.
 */

import { revalidatePath } from "next/cache";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { notify } from "@/lib/notifications";

export async function kansellerBooking(
  id: string,
): Promise<{ ok: boolean; error?: string }> {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  if (!id) return { ok: false, error: "Mangler økt-id" };

  try {
    // Status-guard: bare aktive økter kan avlyses (ikke allerede avlyste).
    const res = await prisma.booking.updateMany({
      where: { id, status: { in: ["PENDING", "CONFIRMED"] } },
      data: { status: "CANCELLED" },
    });

    if (res.count === 0) {
      return { ok: false, error: "Økten kan ikke avlyses (allerede avlyst?)." };
    }

    // Varsle spilleren — best-effort, feiler stille i notify.
    const booking = await prisma.booking.findUnique({
      where: { id },
      select: {
        userId: true,
        startAt: true,
      },
    });
    if (booking?.userId) {
      const dato = booking.startAt.toLocaleDateString("nb-NO", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
      await notify({
        userId: booking.userId,
        type: "booking",
        title: "Økt avlyst",
        body: `Økten din ${dato} er avlyst av coachen din.`,
        link: "/portal/booking",
      });
    }

    revalidatePath(`/admin/gjennomfore/okter/${id}`);
    revalidatePath("/admin/gjennomfore");
    revalidatePath("/admin/bookinger");

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Ukjent feil" };
  }
}
