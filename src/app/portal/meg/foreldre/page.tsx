/**
 * v2 — PlayerHQ Meg · Foresatte (retning C). V2Shell leverer chrome-en
 * (IkonRail/BunnNav), MegForeldreV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbruker den ekte /portal/meg/foreldre-siden: samme
 * requirePortalUser-guard og samme parentRelation-spørring/mapping (ekte data).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
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
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const parentLinks = await prisma.parentRelation.findMany({
    where: { childId: user.id },
    include: {
      parent: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

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
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name ?? "Øyvind Rohjan"} avatarUrl={user.avatarUrl}>
      <MegForeldreV2 data={data} />
    </V2Shell>
  );
}
