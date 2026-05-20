"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";

export async function sendReply(threadId: string, body: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("unauthenticated");
  if (user.tier === "GRATIS") throw new Error("upgrade-required");
  if (!body.trim()) throw new Error("empty-message");

  const session = await prisma.coachingSession.findUnique({ where: { id: threadId } });
  if (!session || session.userId !== user.id) throw new Error("forbidden");

  const eksisterende = Array.isArray(session.messages)
    ? (session.messages as Prisma.InputJsonValue[])
    : [];

  const nyMelding: Prisma.InputJsonValue = {
    role: "user",
    content: body.trim(),
    ts: new Date().toISOString(),
  };

  await prisma.coachingSession.update({
    where: { id: threadId },
    data: { messages: [...eksisterende, nyMelding] },
  });

  revalidatePath(`/portal/coach/melding/${threadId}`);
}
