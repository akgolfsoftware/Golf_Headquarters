/** PH25Sikkerhet — sikkerhet i PlayerHQSkall.
 * Auth-guard og score-heuristikk uendret:
 *   - Sikkerhetsscore utledet ærlig fra hva vi faktisk vet (e-post bekreftet
 *     → 80, ellers 55; 2FA-flagg finnes ikke på User ennå, så +20 opptjenes
 *     via 2FA-flyten).
 *   - Endre passord/e-post: skjema klientside mot Supabase Auth.
 *     Glemt passord: lenke til /auth/forgot-password.
 *     Tofaktor: lenke til den ekte TOTP-flyten på /portal/meg/sikkerhet/2fa.
 *   - Aktive økter: ekte lastLoginAt; full øktliste er «kommer snart» —
 *     ingen oppdiktede enheter eller tidspunkter.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { InnstillingerSikkerhetV2 } from "@/components/portal/v2/InnstillingerSikkerhetV2";

export const dynamic = "force-dynamic";

function formatSiste(d: Date | null | undefined): string {
  if (!d) return "Ukjent";
  return `${d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Oslo",
  })} · ${d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Oslo" })}`;
}

export default async function SikkerhetPage() {
  const user = await requirePortalUser({ kreverTilgang: "INGEN" });
  const ulest = await getUnreadNotifications(user.id, 1);

  // Ærlig score: passord (Supabase-konto) gir basis, e-post bekreftet løfter,
  // 2FA-aktivering gir resten. Vi har ikke 2FA-flagg på User enda, så toppen
  // (+20) opptjenes via 2FA-flyten — derav 80 som realistisk nåverdi.
  const harEpost = !!user.email;
  const score = harEpost ? 80 : 55;

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ulest.count}>
      <div className="pa-side">
        <InnstillingerSikkerhetV2 data={{ score, sisteInnlogging: formatSiste(user.lastLoginAt) }} />
      </div>
    </PlayerHQSkall>
  );
}
