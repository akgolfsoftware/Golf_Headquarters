/**
 * PH-17 Én TrackMan-økt — nytt design (pakke 6, godkjent av Anders 14.10.2026).
 * Fasit: docs/design-system/utkast-playerhq/stats-dybde.html, skjerm «tmokt».
 * Avvik:
 *   - Avvikene mot utkastet står øverst i PH17TmOkt.tsx.
 *
 * Tilgang: eieren, eller en coach med lesetilgang til spilleren (hentTmOkt).
 * Fortsatt bak FEATURES.TRACKMAN_DETAIL, som før.
 * /portal/analysere/* står på talent-allowlisten, så kreverTilgang er TALENT
 * (src/lib/__tests__/tilgang/portal-tilgang-kontrakt.test.ts).
 */
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { FEATURES } from "@/lib/features";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH17TmOkt } from "@/components/portal/precision/PH17TmOkt";
import { hentTmOkt } from "@/lib/portal-analyse/load-trackman-stats";
import { lesTmFilter } from "@/lib/portal-analyse/trackman-stats";
import { getUnreadNotifications } from "@/app/portal/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "TrackMan-økt · PlayerHQ" };

export default async function TrackManOktPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!FEATURES.TRACKMAN_DETAIL) notFound();
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const { id } = await params;
  const [okt, uleste] = await Promise.all([hentTmOkt(id, user), getUnreadNotifications(user.id, 1)]);
  if (!okt) notFound();

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH17TmOkt okt={okt} filter={lesTmFilter(searchParams ? await searchParams : {})} />
    </PlayerHQSkall>
  );
}
