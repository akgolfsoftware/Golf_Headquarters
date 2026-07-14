"use server";

// Server action for v2 · PlayerHQ Coach · Nytt spørsmål (/portal/coach/sporsmal/ny).
// Samme Question-modell og auth-mønster som legacy
// (src/app/portal/(legacy)/coach/sporsmal/actions.ts → stillSporsmal), portet
// til egen v2-rute per ui_kits/playerhq/phq-wizards.jsx → SporsmalNyView.

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { nonEmpty } from "@/lib/validation/schemas";

const StillSporsmalV2Schema = z.object({
  title: nonEmpty(140),
  body: nonEmpty(4000),
});

export type StillSporsmalV2Input = z.infer<typeof StillSporsmalV2Schema>;

// Finn spillerens coach via aktiv enrollering (samme kilde som legacy-actionen
// og drills-data.ts). Returnerer null hvis spilleren ikke har en aktiv coach →
// spørsmålet havner i den åpne køen (coachUserId = null).
async function finnSpillerensCoachId(userId: string): Promise<string | null> {
  const enrollment = await prisma.playerEnrollment.findFirst({
    where: { userId, endedAt: null, coachId: { not: null } },
    orderBy: { enrolledAt: "desc" },
    select: { coachId: true },
  });
  return enrollment?.coachId ?? null;
}

export async function stillSporsmalV2(input: StillSporsmalV2Input): Promise<void> {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });
  const parsed = StillSporsmalV2Schema.parse(input);

  const coachUserId = await finnSpillerensCoachId(user.id);

  await prisma.question.create({
    data: {
      askerUserId: user.id,
      coachUserId,
      title: parsed.title.trim(),
      body: parsed.body.trim(),
      status: "OPEN",
    },
  });

  revalidatePath("/portal/coach/sporsmal/ny");
  revalidatePath("/portal/coach/sporsmal");
  redirect("/portal/coach/sporsmal/ny?sendt=1");
}
