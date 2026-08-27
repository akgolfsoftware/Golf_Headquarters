/**
 * /admin/team/ekstern — administrer eksterne lesere (plan T8, funksjonelt —
 * trenger fasit-runde for endelig utseende). ADMIN-only: opprettelsen gir
 * capabilities og gruppetilganger, og det er Anders' beslutning.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminEksternLeserTrainLock,
  type EksternLeserRad,
} from "@/components/admin/v2/oppsett/AdminEksternLeserTrainLock";
import { TlTilbake } from "@/components/admin/v2/oppsett/tl-kit";

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
    <V2Shell bredde="kolonne" nav={AGENCYOS_NAV} navn={user.name ?? "Admin"}>
      <TlTilbake href="/admin/team">Team</TlTilbake>
      <AdminEksternLeserTrainLock grupper={grupper} lesere={lesere} />
    </V2Shell>
  );
}
