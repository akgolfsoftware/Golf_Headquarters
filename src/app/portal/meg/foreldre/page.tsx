/**
 * PH24Foreldre — foresatte i PlayerHQSkall.
 * Samme parentRelation-spørring. En foresatt sendes til forelder-siden.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { MegForeldreV2, type MegForeldreData } from "@/components/portal/v2/MegForeldreV2";

export const dynamic = "force-dynamic";

function relasjonLabel(r: string): string {
  const lower = r.toLowerCase();
  if (lower === "father" || lower === "far") return "Far";
  if (lower === "mother" || lower === "mor") return "Mor";
  if (lower === "guardian" || lower === "verge") return "Verge";
  return r;
}

export default async function ForeldrePage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const [parentLinks, ulest] = await Promise.all([
    prisma.parentRelation.findMany({
      where: { childId: user.id },
      include: { parent: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    getUnreadNotifications(user.id, 1),
  ]);

  const data: MegForeldreData = {
    foresatte: parentLinks.map((rel) => ({
      id: rel.id,
      navn: rel.parent.name ?? rel.parent.email,
      relasjon: relasjonLabel(rel.relationship),
      kontekst: rel.parent.email,
      href: "/portal/meg/foreldre",
    })),
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <Link href="/portal/meg" className="ph-tilbake">Meg</Link>
        <MegForeldreV2 data={data} />
      </div>
    </PlayerHQSkall>
  );
}
