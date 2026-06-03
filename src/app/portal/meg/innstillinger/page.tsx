/**
 * Innstillinger — /portal/meg/innstillinger (v10-design).
 *
 * Rendrer <Innstillinger> (v10-fasit fra pl-innstillinger) med EKTE data:
 *  - Auth-guard via requirePortalUser.
 *  - Profil/varsler fra Prisma-User + lesPreferences (User.preferences JSON).
 *  - mapInnstillingerData oversetter loader-output → InnstillingerData.
 *
 * Tom-tilstander bevares: hjemmeklubb «Ikke satt» når null, og fasiliteter-
 * slidere returneres tomme ([]) fordi v10-meter-sliderne ikke er schema-backet
 * — aldri liksom-tall.
 *
 * Server component. Bolk (3. juni): byttet fra InnstillingerAccordion (gammelt
 * design) til Innstillinger (v10).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { Innstillinger } from "@/components/portal/meg/innstillinger";
import { mapInnstillingerData } from "./map-innstillinger-data";

export const dynamic = "force-dynamic";

export default async function InnstillingerPage() {
  const user = await requirePortalUser();
  const prefs = lesPreferences(user);

  return <Innstillinger data={mapInnstillingerData(user, prefs)} />;
}
