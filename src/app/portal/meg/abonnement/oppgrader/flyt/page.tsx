// PH-25 Velg Full — Precision Athletics, pakke 14 (utkast meg-resten.html, 16.10.2026).
/**
 * /portal/meg/abonnement/oppgrader/flyt — Velg Full (månedlig eller årlig) og videre til Stripe Checkout.
 *
 * Auth-guard beholdt. Har spilleren alt Full, sendes hen til Abonnement. PAST_DUE sendes også dit:
 * ny checkout oppå et feilet abonnement gir dobbelt abonnement i Stripe; Abonnement viser «Bytt kort».
 * Prøveuka gis av checkout-ruta bare ved første PlayerHQ-abonnement; samme regel avgjør teksten her.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getAbonnementData } from "@/lib/portal-abonnement/abonnement-data";
import { PROVEPERIODE_DAGER } from "@/lib/feature-flags";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25VelgFull } from "@/components/portal/precision/PH25VelgFull";

export const dynamic = "force-dynamic";
export const metadata = { title: "Velg Full · PlayerHQ" };

const DAG = 24 * 60 * 60 * 1000;
const TREKK = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "long", day: "numeric", month: "long" });

export default async function OppgraderFlytPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });

  const { erPro, status } = await getAbonnementData(user.id);
  if (erPro || status === "PAST_DUE") redirect("/portal/meg/abonnement");

  const [tidligere, uleste] = await Promise.all([
    prisma.subscription.findFirst({
      where: { userId: user.id, kind: "PLAYERHQ", stripeSubscriptionId: { not: null } },
      select: { id: true },
    }),
    getUnreadNotifications(user.id, 1),
  ]);

  const naa = new Date();
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH25VelgFull data={{
        faarProveuke: !tidligere,
        forsteTrekk: TREKK.format(new Date(naa.getTime() + PROVEPERIODE_DAGER * DAG)),
      }} />
    </PlayerHQSkall>
  );
}
