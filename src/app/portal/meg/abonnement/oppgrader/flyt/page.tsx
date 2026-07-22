/**
 * /portal/meg/abonnement/oppgrader/flyt — Oppgrader til PRO (checkout-flyt)
 *
 * Mobil-først (430px) flyt mot athletic-designsystemet. Erstatter den tidligere
 * redirect-stubben med en ekte oppgraderings-flyt: PRO-verdi, fast pris
 * 299 kr/mnd og bekreftelse som åpner Stripe Checkout.
 *
 * Auth-guard beholdt. Er brukeren allerede PRO, sendes hen til abonnement-siden.
 * PAST_DUE sendes også dit — ny checkout oppå feilet abonnement gir dobbelt-
 * abonnement i Stripe; hubben viser «Endre kort» som riktig vei.
 * Tier-modell: kun GRATIS + PRO (299 kr/mnd) — ELITE finnes ikke i UI.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getAbonnementData } from "@/lib/portal-abonnement/abonnement-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { OppgraderFlytWizard } from "./oppgrader-flyt-wizard";

export const dynamic = "force-dynamic";

export default async function OppgraderFlytPage() {
  const user = await requirePortalUser();

  const { erPro, status } = await getAbonnementData(user.id);
  if (erPro) {
    redirect("/portal/meg/abonnement");
  }
  if (status === "PAST_DUE") {
    redirect("/portal/meg/abonnement");
  }

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <OppgraderFlytWizard />
    </V2Shell>
  );
}
