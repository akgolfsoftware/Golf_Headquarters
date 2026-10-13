import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getDrillLibraryRich } from "@/lib/portal-drills/drills-data";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import {
  konverterExerciseTilPH13,
  type PH13Drill,
} from "@/lib/portal-drills/ph13-drills-data";
import { PH13DrillBank } from "@/components/portal/precision/PH13DrillBank";
import { osloDatoOgMinutt } from "@/lib/workbench/min-calendar";

export const dynamic = "force-dynamic";

function tredveDagerSiden(): Date {
  return new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
}

export default async function DrillsPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const now = osloDatoOgMinutt(new Date());
  const [dbDrills, sessions] = await Promise.all([
    getDrillLibraryRich(user.id),
    prisma.workbenchSession.findMany({
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
    }),
  ]);

  // Bruk siste 30 dager: distinkte egne økter per drill
  const bruk =
    dbDrills.length > 0
      ? await prisma.trainingDrillV2.findMany({
          where: {
            exerciseId: { in: dbDrills.map((d) => d.id) },
            session: { studentId: user.id, startTime: { gte: tredveDagerSiden() } },
          },
          select: { exerciseId: true, sessionId: true },
        })
      : [];

  const okterPerDrill = new Map<string, Set<string>>();
  for (const b of bruk) {
    if (!b.exerciseId) continue;
    const s = okterPerDrill.get(b.exerciseId) ?? new Set<string>();
    s.add(b.sessionId);
    okterPerDrill.set(b.exerciseId, s);
  }

  const initialDrills: PH13Drill[] =
    dbDrills.length > 0
      ? dbDrills.map((d) =>
          konverterExerciseTilPH13(d, okterPerDrill.get(d.id)?.size ?? 0)
        )
      : [];

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH13DrillBank
        initialDrills={initialDrills}
        sessions={sessions.map((s) => ({
          id: s.id, title: s.title, date: s.date.toISOString().slice(0, 10),
          time: `${String(Math.floor(s.startMinute / 60)).padStart(2, "0")}.${String(s.startMinute % 60).padStart(2, "0")}`,
        }))}
      />
    </PlayerHQSkall>
  );
}
