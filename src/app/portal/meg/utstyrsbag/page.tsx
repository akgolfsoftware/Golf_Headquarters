import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { UtstyrsbagView } from "./utstyrsbag-view";
import type { UtstyrsbagInput } from "./actions";

export default async function UtstyrsbagPage() {
  const user = await requirePortalUser({
    allow: ["PLAYER", "COACH", "ADMIN"],
  });

  const bag = await prisma.equipmentBag.findUnique({
    where: { userId: user.id },
  });

  const initial: UtstyrsbagInput = {
    driver: bag?.driver ?? undefined,
    fairwayWoods: bag?.fairwayWoods ?? undefined,
    hybrids: bag?.hybrids ?? undefined,
    irons: bag?.irons ?? undefined,
    wedges: bag?.wedges ?? undefined,
    putter: bag?.putter ?? undefined,
    ball: bag?.ball ?? undefined,
    bag: bag?.bag ?? undefined,
    notes: bag?.notes ?? undefined,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PlayerHQ · Meg · Mitt utstyr"
        titleLead="Mitt"
        titleItalic="utstyr"
        sub="Logg kølle-utstyret ditt slik at coach kan tilpasse anbefalinger og fitting. Alle felter er valgfrie."
      />

      <UtstyrsbagView initial={initial} finnes={bag != null} />
    </div>
  );
}
