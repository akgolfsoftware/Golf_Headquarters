"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSpillerActionUser } from "@/lib/auth/action-guards";
import { OSLO_YMD_FMT } from "@/lib/jarvis/dagen";
import { iupSynligForSpillerWhere } from "./tilknytning";
import { MAALTALL_IDER, sesongFor } from "./maaltall";

const Schema = z.object({
  maaltall: z.string().refine((id) => MAALTALL_IDER.has(id), "Ukjent måltall"),
  verdi: z.string().trim().max(24),
});

/**
 * Spillerens eget mål for ett IUP-måltall i inneværende skoleår. Tom verdi fjerner målet.
 * Bare eieren, og bare med aktivt WANG-/TN-medlemskap. Trenere sender forslag, de skriver ikke her.
 */
export async function settIupMaal(input: { maaltall: string; verdi: string }): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = Schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Ugyldig mål." };
  const bruker = await requireSpillerActionUser();
  const eier = await prisma.user.findFirst({ where: iupSynligForSpillerWhere(bruker.id), select: { id: true } });
  if (!eier) return { ok: false, error: "Du har ikke IUP." };
  const sesong = sesongFor(OSLO_YMD_FMT.format(new Date())).navn;
  const { maaltall, verdi } = parsed.data;
  if (!verdi) {
    await prisma.iupMaaltallMal.deleteMany({ where: { userId: eier.id, sesong, maaltall } });
  } else {
    await prisma.iupMaaltallMal.upsert({
      where: { userId_sesong_maaltall: { userId: eier.id, sesong, maaltall } },
      create: { userId: eier.id, sesong, maaltall, verdi },
      update: { verdi },
    });
  }
  revalidatePath("/portal/mal/maaltall");
  return { ok: true };
}
