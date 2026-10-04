import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG16bSkoledata } from "@/components/admin/precision/AG16bSkoledata";

export const dynamic = "force-dynamic";
export const metadata = { title: "Skoledata · Grupper · AgencyOS" };

export default async function SkoledataPage({ params }: { params: Promise<{ id: string }> }) {
  // G6: skoledata redigerer årsplan-grunnlaget → EDIT_GROUP_PLANS.
  const user = await requireCapability(Capability.EDIT_GROUP_PLANS);
  const { id } = await params;

  const gruppe = await prisma.group.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!gruppe) notFound();

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG16bSkoledata gruppe={{ id: gruppe.id, navn: gruppe.name }} />
    </AgencyOSSkall>
  );
}
