/**
 * AgencyOS Gruppe-timeplan og faste tider (AG-16a) i Precision Athletics.
 * Ekte data fra prisma.groupSchedule (ingen fabrikering). Oppretting og
 * duplisering kaller opprettGruppeTrening/dupliserGruppeTime fra klienten;
 * begge håndhever eierskap (krevCoach + eierGruppen) på serveren.
 */

import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { AG16Timeplan } from "@/components/admin/precision/AG16Gruppe";
import type { GruppeTimeplanV2Data } from "@/components/admin/v2/GruppeTimeplanV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Timeplan · Grupper · AgencyOS" };

export default async function GruppeTimeplanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ focus?: string }>;
}) {
  const user = await requireCapability(Capability.MANAGE_GROUPS);
  const { id } = await params;
  const { focus } = await searchParams;

  // Samme innsynsregel som gruppesiden: en coach ser egne grupper og grupper
  // hun er aktivt COACH-/ASSISTANT-medlem i. ADMIN ser alle.
  const gruppe = await prisma.group.findFirst({
    where: {
      id,
      ...(user.role === "COACH"
        ? {
            OR: [
              { coachId: user.id },
              { members: { some: { userId: user.id, role: { in: ["COACH", "ASSISTANT"] }, endedAt: null } } },
            ],
          }
        : {}),
    },
    select: { id: true, name: true, schedules: { orderBy: { startAt: "asc" } } },
  });

  if (!gruppe) notFound();

  const naa = new Date();
  const faste = gruppe.schedules.filter((s) => s.recurring && s.recurring !== "NONE");
  const kommende = gruppe.schedules.filter((s) => (!s.recurring || s.recurring === "NONE") && s.endAt >= naa);
  const tidligere = gruppe.schedules.filter((s) => (!s.recurring || s.recurring === "NONE") && s.endAt < naa);

  const toRad = (s: (typeof gruppe.schedules)[number]) => ({
    id: s.id,
    title: s.title,
    description: s.description,
    startAt: s.startAt.toISOString(),
    endAt: s.endAt.toISOString(),
    location: s.location,
    recurring: s.recurring,
    maxParticipants: s.maxParticipants,
  });

  const data: GruppeTimeplanV2Data = {
    groupId: gruppe.id,
    navn: gruppe.name,
    totaltAntall: gruppe.schedules.length,
    faste: faste.map(toRad),
    kommende: kommende.map(toRad),
    tidligere: tidligere.map(toRad),
    focusId: focus ?? null,
  };

  return <AG16Timeplan navn={user.name ?? ""} data={data} />;
}
