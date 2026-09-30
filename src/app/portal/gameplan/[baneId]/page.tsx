/**
 * PlayerHQ · Gameplan og banekart (/portal/gameplan/[baneId]) — Precision Athletics PH-20
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-20.jsx).
 * Hullvelger, skjematisk hullkart og slagvalg fra spillerens egne tee-slag.
 * Sikte og soner ligger som før på /portal/gameplan/[baneId]/hull/[nr].
 */
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getGameplanBane } from "@/lib/gameplan/queries";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH20Bane } from "@/components/portal/precision/PH20Gameplan";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gameplan · PlayerHQ" };

export default async function BaneOverviewPage({ params }: { params: Promise<{ baneId: string }> }) {
  const { baneId } = await params;
  const user = await requirePortalUser();
  const [bane, dash] = await Promise.all([getGameplanBane(baneId, user.id), getUnreadNotifications(user.id, 1).catch(() => null)]);
  if (!bane) notFound();

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={dash?.count ?? 0}>
      <PH20Bane
        bane={{ id: bane.id, navn: bane.navn, klubb: bane.klubb }}
        hull={bane.hull.map((h) => ({ nr: h.holeNumber, par: h.par, meter: h.lengthMeter, tee: h.tee, green: h.green, teeSlag: h.teeSlag }))}
        sisteSlag={bane.sisteSlag ? bane.sisteSlag.toISOString() : null}
        planleggHref={(nr) => `/portal/gameplan/${bane.id}/hull/${nr}?type=planlegg`}
      />
    </PlayerHQSkall>
  );
}
