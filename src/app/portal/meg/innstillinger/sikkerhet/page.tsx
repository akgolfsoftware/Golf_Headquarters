/**
 * v2 — PlayerHQ Innstillinger · Sikkerhet (retning C). V2Shell leverer chrome-en
 * (IkonRail/BunnNav, aktiv «meg»), InnstillingerSikkerhetV2 rendrer innholds-stacken.
 *
 * KANONISK sikkerhet-skjerm etter D7-konsolideringen (Anders 17. juli 2026):
 * /portal/meg/sikkerhet er nå redirect hit; passord-/e-post-skjemaene derfra
 * er flyttet inn i InnstillingerSikkerhetV2. Auth-guard og score-heuristikk
 * uendret:
 *   - Ingen sikkerhetsscore: 2FA-flagget finnes ikke på User, så appen kan
 *     ikke vurdere kontoens sikkerhet. Den viser tilstandene den kjenner
 *     (e-post registrert, siste innlogging) og lenker til tofaktor-flyten.
 *   - Endre passord/e-post: skjema klientside mot Supabase Auth (i
 *     komponenten). Glemt passord: lenke til /auth/forgot-password.
 *     Tofaktor: lenke til den ekte TOTP-flyten på /portal/meg/sikkerhet/2fa.
 *   - Aktive økter: ekte lastLoginAt; full øktliste er «kommer snart» —
 *     ingen oppdiktede enheter eller tidspunkter.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
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

  // Vi har ikke 2FA-flagg på User, så appen kan ikke vurdere kontoens
  // sikkerhet samlet. Den viser tilstandene den faktisk kjenner.
  const harEpost = !!user.email;

  return (
    <V2Shell aktiv="meg" bredde="kolonne" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <InnstillingerSikkerhetV2 data={{ harEpost, sisteInnlogging: formatSiste(user.lastLoginAt) }} />
    </V2Shell>
  );
}
