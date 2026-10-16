/**
 * PlayerHQ · Meg · Foreldre (/portal/meg/foreldre) — PH-24 i nytt design
 * (docs/design-system/utkast-playerhq/meg.html, skjermen «Foreldre»).
 * Viser foreldre koblet til spillerens konto, og om forelderen må godkjenne (under 16, D-63).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { prisma } from "@/lib/prisma";
import { maaHaForesattSamtykke, venterPaaForelder } from "@/lib/auth/minor";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH24Foreldre, type PH24ForeldreData } from "@/components/portal/precision/PH24Foreldre";

export const dynamic = "force-dynamic";
export const metadata = { title: "Foreldre · PlayerHQ" };

const DATO = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Oslo" });

function relasjonLabel(r: string): string {
  const lower = r.toLowerCase();
  if (lower === "father" || lower === "far") return "Far";
  if (lower === "mother" || lower === "mor") return "Mor";
  if (lower === "guardian" || lower === "verge") return "Verge";
  return r;
}

export default async function PH24ForeldrePage() {
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

  const data: PH24ForeldreData = {
    foreldre: parentLinks.map((rel) => ({
      id: rel.id,
      navn: rel.parent.name ?? rel.parent.email,
      relasjon: relasjonLabel(rel.relationship),
      epost: rel.parent.email,
      godkjent: rel.approved,
      siden: DATO.format(rel.updatedAt),
    })),
    under16: maaHaForesattSamtykke(user),
    venterPaaForelder: venterPaaForelder(user),
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <PH24Foreldre data={data} />
    </PlayerHQSkall>
  );
}
