/**
 * PlayerHQ · Foresatte (/portal/meg/foreldre)
 *
 * Viser spillerens egne foresatte/verger koblet via parentRelation-tabellen.
 * Tom-tilstand (stiplet kort) når ingen foresatte er koblet — aldri dummy-data.
 *
 * Server component. Auth-guard via requirePortalUser({ allow: ["PLAYER"] }).
 * PortalShell (layout) eier sidebar/topbar/bunn-nav — denne siden rendrer kun
 * innholdet.
 *
 * mapForeldreData oversetter Prisma parentRelation-rader til ForeldreInfoData.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import {
  ForeldreInfo,
  type ForeldreInfoData,
} from "@/components/portal/meg/foreldre-info";

export const dynamic = "force-dynamic";

function relasjonLabel(r: string): string {
  const lower = r.toLowerCase();
  if (lower === "father" || lower === "far") return "Far";
  if (lower === "mother" || lower === "mor") return "Mor";
  if (lower === "guardian" || lower === "verge") return "Verge";
  return r;
}

type ParentLink = {
  id: string;
  relationship: string;
  parent: { id: string; name: string | null; email: string };
};

/** Oversetter ekte parentRelation-rader → v10 ForeldreInfoData. Tom liste → tom-tilstand. */
function mapForeldreData(links: ParentLink[]): ForeldreInfoData {
  return {
    barn: links.map((rel) => ({
      id: rel.id,
      navn: rel.parent.name ?? rel.parent.email,
      relasjon: relasjonLabel(rel.relationship),
      kontekst: rel.parent.email,
      href: "/portal/meg/foreldre",
    })),
  };
}

export default async function ForeldrePage() {
  const user = await requirePortalUser({ allow: ["PLAYER"] });

  const parentLinks = await prisma.parentRelation.findMany({
    where: { childId: user.id },
    include: {
      parent: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <ForeldreInfo data={mapForeldreData(parentLinks)} />;
}
