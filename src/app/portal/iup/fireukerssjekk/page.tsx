import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentFireukerssjekk } from "@/lib/iup/fireukerssjekk-data";
import { PHIUP01Fireukerssjekk } from "@/components/portal/precision/PHIUP01Fireukerssjekk";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fireukerssjekk · PlayerHQ" };

/** PH-IUP-01. Bare for aktive WANG-/Team Norway-medlemmer (04.10.2026); andre sendes til I dag. */
export default async function FireukerssjekkPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const [data, uleste] = await Promise.all([
    hentFireukerssjekk(),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  if (!data) redirect("/portal");
  return <PHIUP01Fireukerssjekk data={data} uleste={uleste} />;
}
