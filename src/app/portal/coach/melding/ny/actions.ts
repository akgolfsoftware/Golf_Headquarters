"use server";

// Server action for v2 · PlayerHQ Coach · Ny melding (/portal/coach/melding/ny).
// Samme CoachingSession(kind DIRECT)-modell som legacy
// (src/app/portal/(legacy)/coach/melding/ny/actions.ts) og hub-siden
// (src/app/portal/coach/melding/page.tsx), men uten emne-feltet — v2-designet
// (ui_kits/playerhq/phq-wizards.jsx → MeldingNyView) har kun fritekst.

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { kanSendeCoachMelding } from "@/lib/portal-okt/coach-melding-tilgang";
import { prisma } from "@/lib/prisma";
import { nonEmpty } from "@/lib/validation/schemas";

const SendMeldingSchema = z.object({
  coachId: z.string().min(1, "Mottaker er påkrevd"),
  body: nonEmpty(4000),
});

export type SendMeldingNyInput = {
  coachId: string;
  body: string;
};

export async function sendMeldingNyV2(input: SendMeldingNyInput): Promise<void> {
  const { coachId, body } = SendMeldingSchema.parse(input);
  const user = await requirePortalUser({ allow: ["PLAYER"] });
  if (user.tier === "GRATIS") throw new Error("upgrade-required");

  const [enrollering, mottaker] = await Promise.all([
    prisma.playerEnrollment.findFirst({
      where: { userId: user.id, endedAt: null, coachId: { not: null } },
      orderBy: { enrolledAt: "desc" },
      select: { coachId: true },
    }),
    prisma.user.findUnique({
      where: { id: coachId },
      select: { role: true },
    }),
  ]);
  if (
    !kanSendeCoachMelding({
      viewerRole: user.role,
      requestedCoachId: coachId,
      enrolledCoachId: enrollering?.coachId ?? null,
      mottakerRolle: mottaker?.role ?? null,
    })
  ) {
    throw new Error("forbidden");
  }

  // Samme tråd med samme coach: legg meldingen til på den siste DIRECT-samtalen.
  // Serializable + nye forsøk, som coachsiden (admin/messages), så to samtidige meldinger ikke overskriver hverandre.
  const ny = { role: "user", content: body.trim(), ts: new Date().toISOString() };
  const MAX_FORSOK = 3;
  let lagret = false;
  for (let forsok = 0; forsok < MAX_FORSOK && !lagret; forsok++) {
    try {
      await prisma.$transaction(
        async (tx) => {
          const siste = await tx.coachingSession.findFirst({
            where: { userId: user.id, coachId, kind: "DIRECT" },
            orderBy: { createdAt: "desc" },
            select: { id: true, messages: true },
          });
          if (siste) {
            const eksisterende = Array.isArray(siste.messages) ? (siste.messages as Prisma.InputJsonValue[]) : [];
            await tx.coachingSession.update({
              where: { id: siste.id },
              data: { messages: [...eksisterende, ny] as Prisma.InputJsonValue[] },
            });
          } else {
            await tx.coachingSession.create({
              data: { userId: user.id, coachId, kind: "DIRECT", messages: [ny] as Prisma.InputJsonValue[] },
            });
          }
        },
        { isolationLevel: "Serializable" },
      );
      lagret = true;
    } catch (err) {
      const kode = (err as { code?: string } | null)?.code;
      if (kode === "40001" || kode === "40P01") {
        await new Promise((r) => setTimeout(r, 25 * (forsok + 1)));
        continue;
      }
      throw new Error("intern feil");
    }
  }
  if (!lagret) throw new Error("Kunne ikke lagre meldingen etter flere forsøk");

  revalidatePath("/portal/coach");
  redirect("/portal/coach");
}
