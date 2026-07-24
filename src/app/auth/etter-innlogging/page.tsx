/**
 * Rollebasert dispatcher etter innlogging.
 *
 * Standard landingssti når ingen eksplisitt ?next= er oppgitt. Sender hver
 * rolle dit den hører hjemme i stedet for at alle havner på spiller-forsiden:
 * - PARENT        → /forelder
 * - ADMIN / COACH → /admin/agencyos (AgencyOS-cockpit)
 * - ellers        → /portal
 *
 * getCurrentUser (ikke -Raw) håndhever foreldresamtykke-gaten: en mindreårig
 * som venter på samtykke redirectes til /auth/samtykke-venter før vi når hit.
 */

import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { recordLastLogin } from "@/lib/auth/record-last-login";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EtterInnloggingPage() {
  const user = await getCurrentUser();

  // Ikke innlogget → logg inn
  if (!user) redirect("/auth/login");

  // Passord-login lander her (OAuth setter lastLoginAt i oauth-callback).
  // getCurrentUser oppdaterer også stale lastLoginAt, men vi er eksplisitte
  // på denne stien så aktiveringsmetrikken alltid treffer.
  await recordLastLogin(user.id).catch(() => undefined);

  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "ADMIN" || user.role === "COACH") redirect("/admin/agencyos");
  redirect("/portal");
}
