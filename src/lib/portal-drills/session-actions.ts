"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { addDrillFromSource } from "@/lib/workbench/wb-actions";
import { osloDatoOgMinutt } from "@/lib/workbench/min-calendar";

const schema = z.object({ sessionId: z.string().min(1).max(100), exerciseId: z.string().min(1).max(160) });
export type BankSessionResult = { ok: true; alreadyAdded: boolean } | { ok: false; error: string };
export type BankSessionOption = { id: string; title: string; date: string; time: string };

export async function hentBankOktutkast(): Promise<BankSessionOption[]> {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const now = osloDatoOgMinutt(new Date());
  const sessions = await prisma.workbenchSession.findMany({
    where: {
      playerId: user.id, coachId: user.id, status: "DRAFT", blockType: "OEKT",
      isTemplate: false, sourceGroupSessionId: null,
      OR: [
        { date: { gt: new Date(`${now.date}T00:00:00Z`) } },
        { date: new Date(`${now.date}T00:00:00Z`), startMinute: { gt: now.minute } },
      ],
    },
    select: { id: true, title: true, date: true, startMinute: true },
    orderBy: [{ date: "asc" }, { startMinute: "asc" }], take: 30,
  });
  return sessions.map((s) => ({
    id: s.id, title: s.title, date: s.date.toISOString().slice(0, 10),
    time: `${String(Math.floor(s.startMinute / 60)).padStart(2, "0")}.${String(s.startMinute % 60).padStart(2, "0")}`,
  }));
}

/** Banken endrer bare spillerens eget kommende utkast, aldri en coach-/gruppeplan. */
export async function leggBankOvelseIOkt(input: unknown): Promise<BankSessionResult> {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Velg en øvelse og en økt." };
  const { sessionId, exerciseId } = parsed.data;
  const session = await prisma.workbenchSession.findFirst({
    where: { id: sessionId, playerId: user.id, coachId: user.id, sourceGroupSessionId: null, isTemplate: false },
    select: { id: true, date: true, startMinute: true, status: true, blockType: true, drills: { select: { exerciseId: true } } },
  });
  if (!session) return { ok: false, error: "Du kan bare legge øvelsen i ditt eget utkast." };
  const now = osloDatoOgMinutt(new Date());
  const date = session.date.toISOString().slice(0, 10);
  if (session.status !== "DRAFT" || session.blockType !== "OEKT" || date < now.date || (date === now.date && session.startMinute <= now.minute)) {
    return { ok: false, error: "Velg en fremtidig økt som fortsatt er utkast." };
  }
  if (session.drills.some((drill) => drill.exerciseId === exerciseId)) return { ok: true, alreadyAdded: true };
  const result = await addDrillFromSource({ sessionId, sourceId: `drill:${exerciseId}` });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/portal/drills");
  return { ok: true, alreadyAdded: false };
}
