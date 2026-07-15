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
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "PARENT"] });
  if (user.tier === "GRATIS") throw new Error("upgrade-required");

  const session = await prisma.coachingSession.create({
    data: {
      userId: user.id,
      coachId,
      kind: "DIRECT",
      messages: [
        {
          role: "user",
          content: body.trim(),
          ts: new Date().toISOString(),
        },
      ] as Prisma.InputJsonValue[],
    },
  });

  revalidatePath("/portal/coach/melding");
  redirect(`/portal/coach/melding/${session.id}`);
}
