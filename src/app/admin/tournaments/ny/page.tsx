/**
 * CoachHQ · Ny turnering — wizard
 *
 * Full-page multi-stegs wizard (5 steg) for å opprette en ny Tournament.
 * Server-component som henter kursliste og delegerer til klient-komponent.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { NyTurneringWizard } from "./wizard";

export const dynamic = "force-dynamic";

export default async function NyTurneringPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const courses = await prisma.courseDefinition.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-8 px-6 py-12 md:py-16">
      <PageHeader
        eyebrow="CoachHQ · /admin/tournaments/ny"
        titleLead="Opprett en"
        titleItalic="ny"
        titleTrail="turnering."
        sub="Multi-stegs wizard fanger alt vi trenger for startliste, regler og resultatoppfølging."
      />
      <NyTurneringWizard courses={courses} />
    </div>
  );
}
