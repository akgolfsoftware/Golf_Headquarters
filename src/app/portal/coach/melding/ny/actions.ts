"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { nonEmpty } from "@/lib/validation/schemas";

const NyMeldingSchema = z.object({
  recipientId: z.string().min(1, "Mottaker er påkrevd"),
  subject: nonEmpty(500),
  body: nonEmpty(4000),
});

export type NyMeldingInput = {
  recipientId: string;
  subject: string;
  body: string;
};

export async function sendMessage(input: NyMeldingInput) {
  NyMeldingSchema.parse(input);
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.tier === "GRATIS") throw new Error("upgrade-required");
  if (!input.subject.trim()) throw new Error("missing-subject");
  if (!input.body.trim()) throw new Error("missing-body");

  const session = await prisma.coachingSession.create({
    data: {
      userId: user.id,
      coachId: input.recipientId,
      kind: "DIRECT",
      messages: [
        {
          role: "user",
          content: `**${input.subject.trim()}**\n\n${input.body.trim()}`,
          ts: new Date().toISOString(),
        },
      ] as Prisma.InputJsonValue[],
    },
  });

  revalidatePath("/portal/coach/melding");
  redirect(`/portal/coach/melding/${session.id}`);
}

// Stub for Vercel Blob — kontrakten tas i bruk når Blob er konfigurert.
export async function uploadMessageAttachment(formData: FormData): Promise<{
  url: string;
  name: string;
  size: number;
}> {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  void formData;
  // Vercel Blob er ikke konfigurert ennå — feil tydelig i stedet for å returnere
  // et falskt vedlegg. Aktiveres når @vercel/blob put() er på plass.
  throw new Error("Filvedlegg er ikke tilgjengelig ennå.");
}
