import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { prisma } from "@/lib/prisma";
import { editableGroupWhere } from "@/lib/workbench/group-scope";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Topp } from "@/components/admin/agencyos-ny/ny";
import { GRUPPE_BILDE, GruppeFanerNy } from "@/components/admin/precision/AG16Gruppe";
import "@/styles/agencyos-ny-a5-skra.css";
import { SkoledataForm } from "./skoledata-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Skoledata · Grupper · AgencyOS" };

export default async function SkoledataPage({ params }: { params: Promise<{ id: string }> }) {
  // G6: skoledata redigerer årsplan-grunnlaget → EDIT_GROUP_PLANS.
  const user = await requireCapability(Capability.EDIT_GROUP_PLANS);
  const { id } = await params;

  const gruppe = await prisma.group.findFirst({ where: { id, ...editableGroupWhere(user) }, select: { id: true } });
  if (!gruppe) notFound();

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <div className="agn-s agn-a5-under">
        <Topp tilbake={{ href: `/admin/grupper/${id}`, tekst: "Gruppa" }} dato="Gruppa · skoledata" tittel="Legg inn skoledata" bilde={GRUPPE_BILDE}
          ingress="Lim inn skolerute, timeplan eller prøveplan, én rad per linje. Brukes til å legge skolens datoer inn i årsplanen." />
        <GruppeFanerNy groupId={id} aktiv="skoledata" />
        <div className="a5-hvit"><SkoledataForm groupId={id} /></div>
      </div>
    </AgencyOSSkall>
  );
}
