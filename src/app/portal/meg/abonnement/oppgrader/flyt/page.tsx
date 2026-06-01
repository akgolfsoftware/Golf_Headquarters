/**
 * /portal/meg/abonnement/oppgrader/flyt — Oppgrader til PRO (checkout-flyt)
 *
 * Mobil-først (430px) flyt mot athletic-designsystemet. Erstatter den tidligere
 * redirect-stubben med en ekte oppgraderings-flyt: PRO-verdi, månedlig/årlig
 * betaling og bekreftelse som åpner Stripe Checkout.
 *
 * Auth-guard beholdt. Er brukeren allerede PRO, sendes hen til abonnement-siden.
 * Tier-modell: kun GRATIS + PRO (300 kr/mnd) — ELITE finnes ikke i UI.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getAbonnementData } from "@/lib/portal-abonnement/abonnement-data";
import { OppgraderFlytWizard } from "./oppgrader-flyt-wizard";

export const dynamic = "force-dynamic";

export default async function OppgraderFlytPage() {
  const user = await requirePortalUser();

  const { erPro } = await getAbonnementData(user.id);
  if (erPro) {
    redirect("/portal/meg/abonnement");
  }

  return <OppgraderFlytWizard />;
}
