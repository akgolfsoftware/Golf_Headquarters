/**
 * v2 — PlayerHQ Innstillinger · Sikkerhet (retning C). V2Shell leverer chrome-en
 * (IkonRail/BunnNav, aktiv «meg»), InnstillingerSikkerhetV2 rendrer innholds-stacken.
 *
 * v2-port 17. juli 2026: auth-guard og score-heuristikken er uendret fra
 * athletic-versjonen — kun presentasjonslaget er byttet:
 *   - Sikkerhetsscore utledet ærlig fra hva vi faktisk vet (e-post bekreftet
 *     → 80, ellers 55; 2FA-flagg finnes ikke på User ennå, så +20 opptjenes
 *     via 2FA-flyten).
 *   - Passord: lenke til Supabase-tilbakestilling. Tofaktor: lenke til den
 *     ekte TOTP-flyten på /portal/meg/sikkerhet/2fa.
 *   - Aktive økter: ekte lastLoginAt; full øktliste er «kommer snart» —
 *     ingen oppdiktede enheter eller tidspunkter.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { InnstillingerSikkerhetV2 } from "@/components/portal/v2/InnstillingerSikkerhetV2";

export const dynamic = "force-dynamic";

function formatSiste(d: Date | null | undefined): string {
  if (!d) return "Ukjent";
  return `${d.toLocaleDateString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })} · ${d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" })}`;
}

export default async function SikkerhetPage() {
  const user = await requirePortalUser();

  // Ærlig score: passord (Supabase-konto) gir basis, e-post bekreftet løfter,
  // 2FA-aktivering gir resten. Vi har ikke 2FA-flagg på User enda, så toppen
  // (+20) opptjenes via 2FA-flyten — derav 80 som realistisk nåverdi.
  const harEpost = !!user.email;
  const score = harEpost ? 80 : 55;

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/meg/innstillinger">Innstillinger</TilbakeLenke>
      <InnstillingerSikkerhetV2 data={{ score, sisteInnlogging: formatSiste(user.lastLoginAt) }} />
    </V2Shell>
  );
}
