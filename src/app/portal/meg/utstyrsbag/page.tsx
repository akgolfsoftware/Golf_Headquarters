/**
 * PlayerHQ · Meg · Utstyrsbag (/portal/meg/utstyrsbag).
 *
 * Portet fra fersk Claude Design-fasit (ph-screens.jsx · UtstyrScreen):
 * MeSub-skall ("Utstyrs bag.") → kølle-rader (set-group) → BALL & ØVRIG →
 * knapperad (primær «Legg til kølle» + sekundær «Se TrackMan-tall»).
 *
 * Server component henter EKTE EquipmentBag-data og sender inn —
 * visning/redigering i UtstyrsbagView (client, gjenbruker UtstyrsbagForm +
 * lagreUtstyrsbag-action). Auth-guard (PLAYER/COACH/ADMIN) beholdt.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { MeSub } from "@/components/portal/meg/meg-sub";
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
    <MeSub
      eyebrow="MEG · UTSTYRSBAG"
      title="Utstyrs"
      italic="bag."
      lead="Køllesett, ball og spesifikasjoner. Brukes til TrackMan-kalibrering."
    >
      <UtstyrsbagView initial={initial} />
    </MeSub>
  );
}
