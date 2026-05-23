"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { audit } from "@/lib/audit";
import { logError } from "@/lib/error-tracking";
import { resendKlient, FRA_EPOST } from "@/lib/email";
import type { LeaveReason } from "@/generated/prisma/client";

export type StartLeaveInput = {
  reason: LeaveReason;
  startAt: string; // ISO date
  endAt?: string;
  description?: string;
  isInjury?: boolean;
};

/**
 * P14: Start permisjon/skade.
 * Setter User.userStatus + oppretter Leave-record.
 * Varsler coach via e-post.
 */
export async function startLeave(
  input: StartLeaveInput,
): Promise<{ ok: boolean; error?: string; leaveId?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthenticated" };

  try {
    const startDate = new Date(input.startAt);
    const endDate = input.endAt ? new Date(input.endAt) : null;

    // Oppdater user-status
    const newStatus = input.isInjury ? "SKADET" : "PERMISJON";
    await prisma.user.update({
      where: { id: user.id },
      data: { userStatus: newStatus },
    });

    // Opprett Leave
    const leave = await prisma.leave.create({
      data: {
        userId: user.id,
        reason: input.reason,
        startAt: startDate,
        endAt: endDate,
        description: input.description ?? null,
        isInjury: input.isInjury ?? false,
      },
    });

    // Audit
    await audit({
      actorId: user.id,
      action: "user.leave_started",
      target: user.id,
      metadata: {
        reason: input.reason,
        isInjury: input.isInjury,
        startAt: startDate.toISOString(),
      },
    });

    // Varsle coach via e-post
    try {
      const coach = await prisma.user.findFirst({
        where: { role: "COACH" },
        orderBy: { createdAt: "asc" },
      });
      if (coach?.email) {
        const klient = resendKlient();
        await klient.emails.send({
          from: FRA_EPOST,
          to: coach.email,
          subject: `${user.name} starter ${input.isInjury ? "skade-pause" : "permisjon"}`,
          html: `<p>Hei ${coach.name},</p>
            <p><strong>${user.name}</strong> har registrert ${input.isInjury ? "skade" : "permisjon"} fra ${startDate.toLocaleDateString("nb-NO")}.</p>
            <ul>
              <li><strong>Årsak:</strong> ${input.reason}</li>
              ${endDate ? `<li><strong>Planlagt retur:</strong> ${endDate.toLocaleDateString("nb-NO")}</li>` : "<li><strong>Varighet:</strong> Åpen-ende</li>"}
              ${input.description ? `<li><strong>Beskrivelse:</strong> ${input.description}</li>` : ""}
            </ul>
            <p>Abonnement er pauset. Coaching-credits stoppes til retur.</p>
            <p>Mvh,<br/>AK Golf-systemet</p>`,
        });

        await prisma.leave.update({
          where: { id: leave.id },
          data: { notifiedCoach: true },
        });
      }
    } catch (err) {
      console.error("[leave] coach-notification feilet", err);
    }

    revalidatePath("/portal");
    return { ok: true, leaveId: leave.id };
  } catch (error) {
    await logError({
      context: "leave.start",
      error,
      userId: user.id,
    });
    return { ok: false, error: "Kunne ikke starte permisjon." };
  }
}

/**
 * P14: Avslutt permisjon — bruker er tilbake.
 * Krever return-to-play-protokoll hvis isInjury = true.
 */
export async function endLeave(
  leaveId: string,
): Promise<{ ok: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "unauthenticated" };

  try {
    const leave = await prisma.leave.findUnique({ where: { id: leaveId } });
    if (!leave) return { ok: false, error: "Permisjon ikke funnet." };
    if (leave.userId !== user.id) {
      return { ok: false, error: "Du eier ikke denne permisjonen." };
    }
    if (leave.returnedAt) {
      return { ok: false, error: "Permisjonen er allerede avsluttet." };
    }

    await prisma.leave.update({
      where: { id: leaveId },
      data: { returnedAt: new Date(), endAt: leave.endAt ?? new Date() },
    });

    // Sjekk om bruker har andre aktive Leaves
    const otherActive = await prisma.leave.count({
      where: {
        userId: user.id,
        returnedAt: null,
        startAt: { lte: new Date() },
      },
    });

    if (otherActive === 0) {
      // Ingen aktive — bruker er tilbake til AKTIV
      await prisma.user.update({
        where: { id: user.id },
        data: { userStatus: "AKTIV" },
      });
    }

    await audit({
      actorId: user.id,
      action: "user.leave_ended",
      target: user.id,
      metadata: { leaveId, wasInjury: leave.isInjury },
    });

    revalidatePath("/portal");
    return { ok: true };
  } catch (error) {
    await logError({ context: "leave.end", error, userId: user.id });
    return { ok: false, error: "Kunne ikke avslutte permisjon." };
  }
}
