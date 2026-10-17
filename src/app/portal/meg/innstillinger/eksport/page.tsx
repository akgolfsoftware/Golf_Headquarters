// PH-25 Dataene dine — Precision Athletics, pakke 14 (utkast meg-resten.html, 16.10.2026).
/**
 * PlayerHQ · Innstillinger · Dataene dine: hva som er lagret om spilleren, og nedlasting av hele
 * innsynsfila (exportUserData). Lenkes fra Innstillinger, ved «Slett kontoen min».
 * Tallene telles bare for den innloggede brukeren.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25DataeneDine, type PH25DataRad } from "@/components/portal/precision/PH25DataeneDine";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dataene dine · PlayerHQ" };

const OSLO = "Europe/Oslo";
const KL = new Intl.DateTimeFormat("nb-NO", { timeZone: OSLO, hour: "2-digit", minute: "2-digit" });
const DAG = new Intl.DateTimeFormat("sv-SE", { timeZone: OSLO, year: "numeric", month: "2-digit", day: "2-digit" });
const tall = (n: number) => n.toLocaleString("nb-NO");

export default async function DataeneDinePage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  const id = user.id;
  const [okter, runder, slag, tester, trackman, mal, caddie, betalinger, uleste] = await Promise.all([
    prisma.workbenchSession.count({ where: { playerId: id, isTemplate: false } }),
    prisma.round.count({ where: { userId: id } }),
    prisma.shot.count({ where: { round: { userId: id } } }),
    prisma.testResult.count({ where: { userId: id } }),
    prisma.trackManSession.count({ where: { userId: id } }),
    prisma.goal.count({ where: { userId: id } }),
    prisma.caddieMessage.count({ where: { userId: id } }),
    prisma.payment.count({ where: { userId: id } }),
    getUnreadNotifications(id, 1),
  ]);

  const rader: PH25DataRad[] = [
    { navn: "Profil, samtykker og innstillinger", antall: "1", farge: "g9" },
    { navn: "Økter i planen", antall: tall(okter), farge: "tek" },
    { navn: "Runder og slag", antall: `${tall(runder)} · ${tall(slag)}`, farge: "spill" },
    { navn: "Testresultater", antall: tall(tester), farge: "slag" },
    { navn: "TrackMan-økter", antall: tall(trackman), farge: "slag" },
    { navn: "Målsetninger", antall: tall(mal), farge: "g6" },
    { navn: "Meldinger med Caddie", antall: tall(caddie), farge: "g6" },
    { navn: "Betalinger", antall: tall(betalinger), farge: "g6" },
  ];
  const naa = new Date();

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH25DataeneDine data={{
        totalt: 1 + okter + runder + slag + tester + trackman + mal + caddie + betalinger,
        rader,
        talt: `i dag ${KL.format(naa)}`,
        filnavn: `ak-golf-data-${DAG.format(naa)}.json`,
      }} />
    </PlayerHQSkall>
  );
}
