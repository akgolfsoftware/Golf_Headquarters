import { Sidehode } from "@/components/precision/pa";
import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { editableGroupWhere } from "@/lib/workbench/group-scope";
import { GroupContextShell } from "@/components/admin/precision/grupper/GroupContextShell";
import { TlTilbake } from "@/components/admin/precision/grupper/group-kit";
import { GruppeFaner } from "@/components/admin/v2/GruppeFaner";
import { SkoledataForm } from "./skoledata-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Skoledata · Grupper · AgencyOS" };

export default async function SkoledataPage({ params }: { params: Promise<{ id: string }> }) {
  // G6: skoledata redigerer årsplan-grunnlaget → EDIT_GROUP_PLANS.
  const user = await requireCapability(Capability.EDIT_GROUP_PLANS);
  const { id } = await params;

  const gruppe = await prisma.group.findFirst({ where: { id, ...editableGroupWhere(user) }, select: { id: true, name: true, slug: true, program: true } });
  if (!gruppe) notFound();

  return (
    <GroupContextShell group={gruppe} user={user}>
      <TlTilbake href={`/admin/grupper/${id}/arsplan`}>Årsplan</TlTilbake>

      <div className="flex flex-col gap-4">
        <GruppeFaner groupId={id} aktiv="skoledata" />

        <div>
          <Sidehode title="Legg inn skoledata" kicker={gruppe.name} />
          <p className="mb-4 max-w-2xl text-base text-muted-foreground">
            Lim inn skolerute, timeplan eller prøveplan — én rad per linje. Brukes til å legge inn
            strukturen fra skolens prøveplan/timeplan når den er publisert.
          </p>

          <SkoledataForm groupId={id} />
        </div>
      </div>
    </GroupContextShell>
  );
}
