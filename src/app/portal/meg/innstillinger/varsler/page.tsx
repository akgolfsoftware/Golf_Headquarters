// PH25Varsler — Precision Athletics (PH-25, meg.html). Preferanse-oppslaget er uendret; bare visningen er byttet.
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Varsler } from "@/components/portal/precision/PH25Varsler";

export const dynamic = "force-dynamic";

export default async function VarslerPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { preferences: true },
  });
  const prefs = lesPreferences(fullUser ?? { preferences: null });

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH25Varsler data={{ notif: prefs.notif }} />
    </PlayerHQSkall>
  );
}
