// PH24Utstyr — Precision Athletics. Data og handlinger er beholdt.
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
/**
 * PlayerHQ · Meg · Utstyr og bag (PH-24).
 * Kilde: AK Golf Precision Athletics PH-24 (Meg / Utstyrsbag, ui_kits/playerhq/screens/PH-24.jsx).
 *
 * 14-køllers bag med spesifikasjoner og målte TrackMan carry-lengder (gapping-trapp).
 * Leser EquipmentBag og gapping fra TrackMan; lagrer via lagreUtstyrsbag.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { hentUtstyrFlate } from "@/lib/portal/utstyr-data";
import { PH24Utstyr } from "@/components/portal/precision/PH24Utstyr";
import { lagreUtstyrsbag, type UtstyrsbagInput } from "@/app/portal/meg/utstyrsbag/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Utstyr · PlayerHQ" };

export default async function UtstyrPage() {
  const user = await requirePortalUser({
    kreverTilgang: "INGEN",
    allow: ["PLAYER", "COACH", "ADMIN"],
  });
  if (user.role === "PARENT") redirect("/forelder");

  const [data, bag] = await Promise.all([
    hentUtstyrFlate(user.id),
    prisma.equipmentBag.findUnique({ where: { userId: user.id } }),
  ]);

  const utstyr: UtstyrsbagInput = {
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
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH24Utstyr data={data} initialBag={utstyr} onLagreBag={lagreUtstyrsbag} />
    </PlayerHQSkall>
  );
}
