/**
 * Innstillinger — /portal/meg/innstillinger
 * Mobil-først accordion (port av components-innstillinger.html fra Claude Design).
 *
 * Server-component:
 *  - Auth-guard via requirePortalUser
 *  - Henter ekte data: navn/e-post/hjemmeklubb/avatar, notif-preferanser,
 *    tilgjengelige fasiliteter
 *  - Rendrer InnstillingerAccordion (Profil · Fasiliteter · Varsler · Personvern)
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { InnstillingerAccordion } from "@/components/portal/innstillinger/innstillinger-accordion";

export const dynamic = "force-dynamic";

function initials(name: string | null | undefined): string {
  if (!name) return "??";
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function InnstillingerPage() {
  const user = await requirePortalUser();
  const prefs = lesPreferences(user);

  return (
    <InnstillingerAccordion
      profil={{
        navn: user.name ?? "Spiller",
        epost: user.email ?? "",
        hjemmeklubb: user.homeClub ?? null,
        avatarUrl: user.avatarUrl ?? null,
        initialer: initials(user.name),
      }}
      notif={prefs.notif}
      fasiliteter={user.tilgjengeligeFasiliteter}
    />
  );
}
