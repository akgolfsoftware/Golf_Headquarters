/**
 * v2 — PlayerHQ Innstillinger (retning C). V2Shell leverer chrome-en
 * (IkonRail/BunnNav, aktiv «meg»), InnstillingerV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbruker de ekte kildene: requirePortalUser gir
 * bruker (e-post, notif-preferanser, samtykke-felt), getAbonnementData gir
 * FAKTISK abonnementstilstand. Foreldrenavnet slås opp via
 * guardianConsentByUserId. Ingen fabrikerte verdier.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getAbonnementData } from "@/lib/portal-abonnement/abonnement-data";
import { lesPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { InnstillingerV2, type InnstillingerData } from "@/components/portal/v2/InnstillingerV2";
import { TilbakeLenke } from "@/components/v2";

export const dynamic = "force-dynamic";

function formatDato(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
}

export default async function InnstillingerPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const prefs = lesPreferences(user);

  // Foreldrenavn (kun oppslag når samtykke faktisk er godkjent av noen).
  const [abo, forelder] = await Promise.all([
    getAbonnementData(user.id),
    user.guardianConsentByUserId
      ? prisma.user.findUnique({ where: { id: user.guardianConsentByUserId }, select: { name: true } })
      : Promise.resolve(null),
  ]);

  // Abonnement-kanon: gratis via coaching-pakke (credits) / prøve / gruppe,
  // ellers 299 kr/mnd. «betaler» = FAKTISK PRO uten coaching-pakke.
  const harPakke = abo.monthlyCredits > 0;
  const pakkeNavn = abo.monthlyCredits >= 4 ? "Performance Pro" : harPakke ? "Performance" : null;
  const gratis = harPakke || !abo.erPro;
  const betaler = abo.erPro && !harPakke;

  const data: InnstillingerData = {
    epost: user.email,
    notif: prefs.notif,
    samtykke: {
      kreves: user.requiresGuardianConsent,
      godkjentDato: formatDato(user.guardianConsentGivenAt),
      godkjentAv: forelder?.name ?? null,
    },
    abonnement: {
      gratis,
      pakkeNavn,
      betaler,
      nesteTrekk: betaler ? formatDato(abo.nesteTrekk) : null,
    },
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/meg">Meg</TilbakeLenke>
      <InnstillingerV2 data={data} />
    </V2Shell>
  );
}
