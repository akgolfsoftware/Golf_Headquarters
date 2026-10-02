/**
 * Innstillinger (/portal/meg/innstillinger) — Precision Athletics PH-25
 * (Claude Design 7d7c2994, ui_kits/playerhq/screens/PH-25.jsx).
 * Auth, preferanser, foreldresamtykke og abonnementsstatus er uendret.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getAbonnementData } from "@/lib/portal-abonnement/abonnement-data";
import { hentUleste } from "@/lib/portal-booking/uleste";
import { lesPreferences } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { pakkeNavn } from "@/lib/domain/abonnement";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH25Innstillinger, type PH25InnstillingerData } from "@/components/portal/precision/PH25Abonnement";

export const dynamic = "force-dynamic";
export const metadata = { title: "Innstillinger · PlayerHQ" };

const OSLO_DATO = new Intl.DateTimeFormat("nb-NO", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Oslo" });
const formatDato = (d: Date | null) => (d ? OSLO_DATO.format(d) : null);

export default async function InnstillingerPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const prefs = lesPreferences(user);
  const [abo, forelder, uleste] = await Promise.all([
    getAbonnementData(user.id),
    user.guardianConsentByUserId
      ? prisma.user.findUnique({ where: { id: user.guardianConsentByUserId }, select: { name: true } })
      : Promise.resolve(null),
    hentUleste(user.id),
  ]);

  const harPakke = abo.monthlyCredits > 0;
  const pakke = pakkeNavn(abo.monthlyCredits);
  const betaler = abo.erPro && !harPakke;
  const fullNa = user.tilgang.nivaa === "FULL";
  const nesteTrekk = betaler ? formatDato(abo.nesteTrekk) : null;
  const tekst = !fullNa
    ? "Gratis nivå"
    : harPakke
      ? `Inkludert i coaching-pakken din${pakke ? ` (${pakke})` : ""}`
      : betaler
        ? nesteTrekk ? `299 kr per mnd · fornyes ${nesteTrekk}` : "299 kr per mnd"
        : "Inkludert, uten månedspris";

  const data: PH25InnstillingerData = {
    epost: user.email,
    notif: prefs.notif,
    venneOktSynlig: prefs.venneOktSynlig,
    samtykke: {
      kreves: user.requiresGuardianConsent,
      godkjentDato: formatDato(user.guardianConsentGivenAt),
      godkjentAv: forelder?.name ?? null,
    },
    abonnement: { nivaa: fullNa ? "FULL" : "TALENT", tekst },
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH25Innstillinger data={data} />
    </PlayerHQSkall>
  );
}
