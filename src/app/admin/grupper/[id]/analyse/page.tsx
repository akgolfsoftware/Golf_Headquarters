/**
 * AG-A03 Gruppeanalyse — /admin/grupper/[id]/analyse (fanen «Stats» i Gruppa).
 * Samme innsynsregel som Gruppa: eier, eller aktivt COACH-/ASSISTANT-medlem.
 */
import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AGA03Gruppeanalyse } from "@/components/admin/precision/AGA03Gruppeanalyse";
import { lastEnGruppeAnalyse } from "@/lib/admin/analyse/gruppe-analyse";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gruppeanalyse · AgencyOS" };

export default async function GruppeanalysePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCapability(Capability.MANAGE_GROUPS);
  const { id } = await params;
  const gruppe = await prisma.group.findFirst({
    where: {
      id,
      ...(user.role === "COACH"
        ? { OR: [{ coachId: user.id }, { members: { some: { userId: user.id, role: { in: ["COACH", "ASSISTANT"] }, endedAt: null } } }] }
        : {}),
    },
    select: { id: true, name: true, members: { where: { endedAt: null, role: "PLAYER" }, select: { userId: true } } },
  });
  if (!gruppe) notFound();
  const analyse = await lastEnGruppeAnalyse(gruppe.members.map((m) => m.userId));
  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AGA03Gruppeanalyse groupId={gruppe.id} navn={gruppe.name} analyse={analyse} />
    </AgencyOSSkall>
  );
}
