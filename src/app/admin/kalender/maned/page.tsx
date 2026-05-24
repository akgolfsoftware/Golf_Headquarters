/**
 * Kalender måned — /admin/kalender/maned
 *
 * Pixel-perfekt PR5: 6-rad måneds-grid, max 3 økt-pills per dag,
 * "+N til"-overflow, side-panel-detalj.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { ManedGrid, type ManedOkt } from "@/components/admin-kalender-v2/maned-grid";

export const dynamic = "force-dynamic";

const DEMO: ManedOkt[] = (() => {
  const idag = new Date();
  const aar = idag.getFullYear();
  const mnd = idag.getMonth();
  const items: ManedOkt[] = [];
  const titler = ["Driver-økt", "FYS · styrke", "Banespill 9 hull", "Innspill 100-150m", "TEK · sving", "Putting", "Turnerings-prep", "Junior-gruppe"];
  const pyrs: ManedOkt["pyramide"][] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
  const navn = ["Markus R-P", "Thea L", "Oliver K", "Emma S", "Noah B", "Sofia H", "Lucas A", "Iben M"];
  for (let dag = 1; dag <= 28; dag++) {
    const antall = ((dag * 7) % 5);
    for (let i = 0; i < antall; i++) {
      const t = 8 + ((dag + i * 3) % 12);
      items.push({
        id: `demo-${dag}-${i}`,
        dato: `${aar}-${String(mnd + 1).padStart(2, "0")}-${String(dag).padStart(2, "0")}`,
        startTime: `${String(t).padStart(2, "0")}:00`,
        endTime: `${String(t + 1).padStart(2, "0")}:30`,
        title: titler[(dag + i) % titler.length],
        pyramide: pyrs[(dag + i) % pyrs.length],
        spillerNavn: navn[(dag + i) % navn.length],
        coachNavn: "Anders K",
      });
    }
  }
  return items;
})();

function pyramideForOkt(p: string | null | undefined): ManedOkt["pyramide"] {
  if (p === "FYS" || p === "TEK" || p === "SLAG" || p === "SPILL" || p === "TURN") return p;
  return "TEK";
}

export default async function KalenderManedPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const idag = new Date();
  const mndStart = new Date(idag.getFullYear(), idag.getMonth(), 1);
  const mndSlutt = new Date(idag.getFullYear(), idag.getMonth() + 1, 1);

  // Utvid med 1 uke før/etter for å fylle 6-rad-grid
  const utvidetStart = new Date(mndStart);
  utvidetStart.setDate(utvidetStart.getDate() - 7);
  const utvidetSlutt = new Date(mndSlutt);
  utvidetSlutt.setDate(utvidetSlutt.getDate() + 7);

  const dbOkter = await prisma.trainingSessionV2.findMany({
    where: { startTime: { gte: utvidetStart, lt: utvidetSlutt } },
    take: 500,
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

  const userIds = Array.from(new Set([
    ...dbOkter.map((o) => o.coachId),
    ...dbOkter.map((o) => o.studentId).filter((id): id is string => id !== null),
  ]));
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u.name ?? "Ukjent"]));

  const okter: ManedOkt[] = dbOkter.map((o) => {
    const dato = new Date(o.startTime);
    const slutt = new Date(o.endTime);
    const iso = `${dato.getFullYear()}-${String(dato.getMonth() + 1).padStart(2, "0")}-${String(dato.getDate()).padStart(2, "0")}`;
    return {
      id: o.id,
      dato: iso,
      startTime: `${String(dato.getHours()).padStart(2, "0")}:${String(dato.getMinutes()).padStart(2, "0")}`,
      endTime: `${String(slutt.getHours()).padStart(2, "0")}:${String(slutt.getMinutes()).padStart(2, "0")}`,
      title: o.title,
      pyramide: pyramideForOkt(o.drills[0]?.pyramide),
      coachNavn: userMap.get(o.coachId) ?? "Ukjent",
      spillerNavn: o.studentId ? userMap.get(o.studentId) ?? null : null,
    };
  });

  const visOkter = okter.length > 0 ? okter : DEMO;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="CoachHQ · kalender · måned"
        titleLead="Hele"
        titleItalic="måneden"
        sub={`${visOkter.length} økter totalt`}
      />
      <ManedGrid okter={visOkter} />
    </div>
  );
}
