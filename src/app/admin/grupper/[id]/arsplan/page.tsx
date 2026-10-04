/**
 * AgencyOS Gruppe-årsplan (AG-16b, Precision Athletics). Samme kalenderdata
 * (hentGruppeKalenderData) som den offentlige /team-wang-siden; ingen
 * personlig spillerdata. Skallet gir Hurtigknappen.
 */

import { notFound } from "next/navigation";
import { requireCapability } from "@/lib/auth/requireCapability";
import { Capability } from "@/lib/auth/cbac";
import { canUser } from "@/lib/auth/effective-capabilities";
import { prisma } from "@/lib/prisma";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG16bArsplan } from "@/components/admin/precision/AG16bArsplan";
import { hentGruppeKalenderData } from "@/lib/gruppe-kalender/hent-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Årsplan · Grupper · AgencyOS" };

export default async function GruppeArsplanPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ trinn?: string }>;
}) {
  // G6: årsplan-flaten er lesevisning av gruppeplanen → VIEW_GROUP_PLANS.
  const user = await requireCapability(Capability.VIEW_GROUP_PLANS);
  const { id } = await params;
  const { trinn } = await searchParams;

  const gruppe = await prisma.group.findUnique({ where: { id }, select: { id: true, name: true } });
  if (!gruppe) notFound();

  const data = await hentGruppeKalenderData(gruppe.name);
  const kanRedigere = await canUser(user, Capability.EDIT_GROUP_PLANS);

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG16bArsplan
        tilstand={data ? "data" : "tom"}
        gruppe={{ id: gruppe.id, navn: gruppe.name }}
        data={data}
        trinn={trinn && ["VG1", "VG2", "VG3"].includes(trinn) ? trinn : null}
        kanRedigere={kanRedigere}
      />
    </AgencyOSSkall>
  );
}
