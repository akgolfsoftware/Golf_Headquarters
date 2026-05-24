/**
 * Kalender uke — /admin/kalender/uke
 *
 * Pixel-perfekt PR5: 7-dagers grid med tidsslot-akse, økt-blokker
 * fargekodet per pyramide, filter alle/mine/ledig, uke-velger.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { UkeGrid, type UkeOkt } from "@/components/admin-kalender-v2/uke-grid";

export const dynamic = "force-dynamic";

// Demo-data for tom DB
const DEMO_OKTER: UkeOkt[] = [
  { id: "d1", dag: 0, startTime: "09:00", endTime: "10:30", title: "Driver-økt", pyramide: "TEK", coachId: "demo-coach", coachNavn: "Anders K", spillerNavn: "Markus R-P" },
  { id: "d2", dag: 0, startTime: "11:00", endTime: "12:00", title: "FYS · styrke", pyramide: "FYS", coachId: "demo-coach", coachNavn: "Anders K", spillerNavn: "Thea L" },
  { id: "d3", dag: 0, startTime: "14:00", endTime: "16:00", title: "Banespill", pyramide: "SPILL", coachId: "demo-coach", coachNavn: "Anders K", spillerNavn: "Oliver K" },
  { id: "d4", dag: 1, startTime: "10:00", endTime: "11:30", title: "Innspill 100-150m", pyramide: "SLAG", coachId: "demo-coach", coachNavn: "Anders K", spillerNavn: "Emma S" },
  { id: "d5", dag: 1, startTime: "13:00", endTime: "14:30", title: "TEK · sving-fundament", pyramide: "TEK", coachId: "demo-coach", coachNavn: "Anders K", spillerNavn: "Noah B" },
  { id: "d6", dag: 2, startTime: "08:30", endTime: "09:30", title: "FYS · mobilitet", pyramide: "FYS", coachId: "demo-coach", coachNavn: "Anders K", spillerNavn: "Sofia H" },
  { id: "d7", dag: 2, startTime: "15:00", endTime: "17:00", title: "Turnerings-prep", pyramide: "TURN", coachId: "demo-coach", coachNavn: "Anders K", spillerNavn: "Lucas A" },
  { id: "d8", dag: 3, startTime: "09:30", endTime: "11:00", title: "Putting 3-6m", pyramide: "SLAG", coachId: "demo-coach", coachNavn: "Anders K", spillerNavn: "Iben M" },
  { id: "d9", dag: 3, startTime: "13:30", endTime: "14:30", title: "Coach-meeting", pyramide: "TURN", coachId: "demo-coach", coachNavn: "Anders K", spillerNavn: null },
  { id: "d10", dag: 4, startTime: "10:00", endTime: "12:00", title: "Banespill 9 hull", pyramide: "SPILL", coachId: "demo-coach", coachNavn: "Anders K", spillerNavn: "Markus R-P" },
  { id: "d11", dag: 4, startTime: "14:00", endTime: "15:00", title: "FYS", pyramide: "FYS", coachId: "demo-coach", coachNavn: "Anders K", spillerNavn: "Thea L" },
  { id: "d12", dag: 5, startTime: "09:00", endTime: "10:30", title: "Junior-gruppe", pyramide: "TEK", coachId: "demo-coach", coachNavn: "Anders K", spillerNavn: null },
];

function pyramideForOkt(p: string | null | undefined): UkeOkt["pyramide"] {
  if (p === "FYS" || p === "TEK" || p === "SLAG" || p === "SPILL" || p === "TURN") return p;
  return "TEK";
}

export default async function KalenderUkePage() {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  // Beregn ukestart (mandag) og uke-slutt
  const idag = new Date();
  const dagIUken = (idag.getDay() + 6) % 7;
  const ukeStart = new Date(idag);
  ukeStart.setDate(idag.getDate() - dagIUken);
  ukeStart.setHours(0, 0, 0, 0);
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeStart.getDate() + 7);

  // Hent økter for denne uka
  const dbOkter = await prisma.trainingSessionV2.findMany({
    where: {
      startTime: { gte: ukeStart, lt: ukeSlutt },
    },
    take: 200,
    select: {
      id: true,
      title: true,
      startTime: true,
      endTime: true,
      coachId: true,
      studentId: true,
      drills: { take: 1, select: { pyramide: true } },
    },
  });

  // Hent navn for coach/student
  const userIds = Array.from(new Set([
    ...dbOkter.map((o) => o.coachId),
    ...dbOkter.map((o) => o.studentId).filter((id): id is string => id !== null),
  ]));
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u.name ?? "Ukjent"]));

  const okter: UkeOkt[] = dbOkter.map((o) => {
    const dato = new Date(o.startTime);
    const slutt = new Date(o.endTime);
    const dag = (dato.getDay() + 6) % 7;
    return {
      id: o.id,
      dag,
      startTime: `${String(dato.getHours()).padStart(2, "0")}:${String(dato.getMinutes()).padStart(2, "0")}`,
      endTime: `${String(slutt.getHours()).padStart(2, "0")}:${String(slutt.getMinutes()).padStart(2, "0")}`,
      title: o.title,
      pyramide: pyramideForOkt(o.drills[0]?.pyramide),
      coachId: o.coachId,
      coachNavn: userMap.get(o.coachId) ?? "Ukjent",
      spillerNavn: o.studentId ? userMap.get(o.studentId) ?? null : null,
    };
  });

  const visOkter = okter.length > 0 ? okter : DEMO_OKTER;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · kalender · uke"
        titleLead="Denne"
        titleItalic="uka"
        sub={`${visOkter.length} økter planlagt · drag for å flytte (kommer)`}
      />
      <UkeGrid okter={visOkter} currentUserId={coach.id} />
    </div>
  );
}
