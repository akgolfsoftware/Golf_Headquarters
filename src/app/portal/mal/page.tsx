/**
 * PH-11-MAL Målsetninger i nytt design (PlayerHQSkall). Komponent: PHMalsetninger.
 * Samme innhold er nivået Målsetninger i Workbench (/portal/planlegge/workbench?niva=malsetninger).
 *
 * «Mål» heter Målsetninger. Talentradar vises aldri for spilleren.
 */

import { harEgenIupInngang } from "@/lib/iup/oversikt";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHMalsetninger } from "@/components/portal/precision/PHMalsetninger";
import { hentMalsetningerSide } from "@/lib/portal-mal/maal-ny-last";

export const dynamic = "force-dynamic";

export default async function PH19MalPage() {
  const user = await requirePortalUser();

  const [side, visIup, uleste] = await Promise.all([
    hentMalsetningerSide(user),
    ["PLAYER", "COACH", "ADMIN"].includes(user.role) ? harEgenIupInngang() : Promise.resolve(false),
    prisma.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PHMalsetninger visIup={visIup} avsluttede={side.avsluttede} data={{ goals: side.goals, milepael: side.milepael }} />
    </PlayerHQSkall>
  );
}
