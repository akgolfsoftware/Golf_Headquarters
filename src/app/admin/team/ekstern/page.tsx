/**
 * /admin/team/ekstern — administrer eksterne lesere (plan T8, funksjonelt —
 * trenger fasit-runde for endelig utseende). ADMIN-only: opprettelsen gir
 * capabilities og gruppetilganger, og det er Anders' beslutning.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG23Ekstern, type EksternLeserRad } from "@/components/admin/precision/AG23Team";

export const dynamic = "force-dynamic";
export const metadata = { title: "Eksterne lesere · AgencyOS" };

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
      <AG23Ekstern tilstand="data" grupper={grupper} lesere={lesere} />
    </AgencyOSSkall>
  );
}
