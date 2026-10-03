/**
 * PH25InnstillingerHub — innstillinger i PlayerHQSkall.
 * Samme abonnement, samtykke og lagring av varsler og synlighet.
 * En foresatt og en gjest slipper ikke inn.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { getAbonnementData } from "@/lib/portal-abonnement/abonnement-data";
import { lesPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { InnstillingerV2, type InnstillingerData } from "@/components/portal/v2/InnstillingerV2";
import { pakkeNavn } from "@/lib/domain/abonnement";

export const dynamic = "force-dynamic";

function formatDato(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
}

export default async function InnstillingerPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const prefs = lesPreferences(user);
  const [abo, forelder, ulest] = await Promise.all([
    getAbonnementData(user.id),
    user.guardianConsentByUserId
      ? prisma.user.findUnique({ where: { id: user.guardianConsentByUserId }, select: { name: true } })
      : Promise.resolve(null),
    getUnreadNotifications(user.id, 1),
  ]);
  const harPakke = abo.monthlyCredits > 0;
  const betaler = abo.erPro && !harPakke;
  const data: InnstillingerData = {
    epost: user.email,
    notif: prefs.notif,
    venneOktSynlig: prefs.venneOktSynlig,
    samtykke: {
      kreves: user.requiresGuardianConsent,
      godkjentDato: formatDato(user.guardianConsentGivenAt),
      godkjentAv: forelder?.name ?? null,
    },
    abonnement: {
      gratis: harPakke || !abo.erPro,
      pakkeNavn: pakkeNavn(abo.monthlyCredits),
      betaler,
      nesteTrekk: betaler ? formatDato(abo.nesteTrekk) : null,
    },
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side"><InnstillingerV2 data={data} /></div>
    </PlayerHQSkall>
  );
}
