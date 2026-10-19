/**
 * AgencyOS · Ny turnering i nytt design (AG17TurneringNy, 19.10.2026).
 * Server-komponent henter banelista og gir den til veiviseren.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { Topp } from "@/components/admin/agencyos-ny/ny";
import { AG17TurneringNy } from "@/components/admin/precision/AG17TurneringNy";

export const dynamic = "force-dynamic";
export const metadata = { title: "Ny turnering · AgencyOS" };

export default async function NyTurneringPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const courses = await prisma.courseDefinition.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <div className="agn-s">
        <Topp tilbake={{ href: "/admin/turnering", tekst: "Turneringer" }} dato="Turneringer · ny" tittel="Ny turnering"
          ingress="Fem steg. Detaljene kan endres fra turneringssiden etterpå." />
        <AG17TurneringNy courses={courses} />
      </div>
    </AgencyOSSkall>
  );
}
