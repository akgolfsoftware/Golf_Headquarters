import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { editableGroupWhere } from "@/lib/workbench/group-scope";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Side, SideHode } from "@/components/precision/pa-a4";
import { KnappLenke } from "@/components/precision/pa";
import { RullUtMalPanel } from "@/components/admin/v2/RullUtMalPanel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rull ut mal · AgencyOS" };
export default async function MalUtrullingPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireCapability(Capability.EDIT_GROUP_PLANS);
  const { id } = await params;
  const [mal, grupper] = await Promise.all([
    prisma.planTemplate.findFirst({ where: { id, approved: true }, select: { id: true, name: true, varighetUker: true, _count: { select: { sessions: true } } } }),
    prisma.group.findMany({ where: editableGroupWhere(user), select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);
  if (!mal) notFound();
  return <AgencyOSSkall navn={user.name ?? "Coach"}><Side max={1120}><SideHode kicker="Plan · maler" title="Rull ut mal" sub={mal.name} actions={<KnappLenke variant="ghost" href="/admin/plan">Til plan-hub</KnappLenke>} /><RullUtMalPanel grupper={grupper} maler={[{ ...mal, sessionCount: mal._count.sessions }]} initialTemplateId={mal.id} /></Side></AgencyOSSkall>;
}
