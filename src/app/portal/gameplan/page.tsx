/**
 * PlayerHQ · Gameplan, banebibliotek (/portal/gameplan) — Precision Athletics PH-20
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-20.jsx). Data som før (getBaneLibrary).
 */
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getBaneLibrary } from "@/lib/gameplan/queries";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH20Baner, type PH20BaneKort } from "@/components/portal/precision/PH20Gameplan";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gameplan · PlayerHQ" };

export default async function V2GameplanPreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  let baner: PH20BaneKort[] = [];
  let feil = false;
  let uleste = 0;
  try {
    const lib = await getBaneLibrary(user.id);
    const [hull, dash] = await Promise.all([
      prisma.courseHole.groupBy({ by: ["baneId"], where: { baneId: { in: lib.map((b) => b.id) } }, _sum: { par: true, lengthMeter: true } }),
      getUnreadNotifications(user.id, 1).catch(() => null),
    ]);
    uleste = dash?.count ?? 0;
    const sum = new Map(hull.map((h) => [h.baneId, h._sum]));
    baner = lib.map((b) => ({
      id: b.id, navn: b.navn, klubb: b.klubb, hull: b.holesMapped, kartlagt: b.hasGeometry, runder: b.playerRounds,
      par: sum.get(b.id)?.par || null, meter: sum.get(b.id)?.lengthMeter || null,
    }));
  } catch {
    feil = true;
  }

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH20Baner baner={baner} feil={feil} />
    </PlayerHQSkall>
  );
}
