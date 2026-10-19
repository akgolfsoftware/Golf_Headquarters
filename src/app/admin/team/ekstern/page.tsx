/**
 * /admin/team/ekstern — administrer eksterne lesere (plan T8), i Precision Athletics.
 * ADMIN-only: opprettelsen gir capabilities og gruppetilganger, og det er Anders' beslutning.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Topp } from "@/components/admin/agencyos-ny/ny";
import { EksterneLesere, type EksternLeserRad } from "@/components/admin/agencyos-ny/EksterneLesere";

export const dynamic = "force-dynamic";

export default async function AdminEksternLeserPage() {
  const user = await requirePortalUser({ allow: ["ADMIN"] });

  const [grupper, aktiveTilganger] = await Promise.all([
    prisma.group.findMany({
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.eksternLeserGruppe.findMany({
      where: { revokedAt: null },
      select: { userId: true, groupId: true },
    }),
  ]);

  const gruppeNavn = new Map(grupper.map((g) => [g.id, g.name]));
  const perLeser = new Map<string, string[]>();
  for (const rad of aktiveTilganger) {
    const navn = gruppeNavn.get(rad.groupId) ?? rad.groupId;
    const liste = perLeser.get(rad.userId);
    if (liste) liste.push(navn);
    else perLeser.set(rad.userId, [navn]);
  }

  const lesere: EksternLeserRad[] =
    perLeser.size === 0
      ? []
      : (
          await prisma.user.findMany({
            where: { id: { in: [...perLeser.keys()] }, role: "GUEST" },
            select: { id: true, name: true, email: true },
            orderBy: { name: "asc" },
          })
        ).map((leser) => ({
          id: leser.id,
          navn: leser.name ?? "Uten navn",
          epost: leser.email,
          grupper: perLeser.get(leser.id) ?? [],
        }));

  return (
    <AgencyOSSkall navn={user.name ?? "Admin"}>
      <div className="agn-s">
        <Topp tilbake={{ href: "/admin/oppsett?fane=team", tekst: "Oppsett" }} dato="Oppsett · team og tilgang" tittel="Eksterne lesere"
          ingress="Eksterne lesere ser bare det spilleren selv har delt. Gruppemedlemskap alene gir ikke innsyn." />
        <EksterneLesere grupper={grupper} lesere={lesere} />
      </div>
    </AgencyOSSkall>
  );
}
