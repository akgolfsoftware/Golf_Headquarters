/**
 * AgencyOS Hjem — Train-lock (STEG 15.10, 31.08.2026). Egen top-level
 * route-group (v2preview) som IKKE arver PortalShell/AdminShell — kun
 * root-layout — så V2Shell leverer all chrome (rail/dock) i mørk v2-scope.
 *
 * Fasit: designsystem/canvas/agencyos-ia/Hjem.dc.html + HjemMobil.dc.html.
 * Slår sammen to tidligere adresser (MASTERPLAN 15.10): denne siden
 * (tidligere «Konsoll»/AG-01) + /admin/brief (Daglig brief, nå redirect
 * hit). Se TrainLockCockpit.tsx-hodet for hva som falt bort i
 * sammenslåingen og hvorfor.
 *
 * Kø-kortet bruker EKSAKT samme lasting som /admin/ko (lastGodkjenninger +
 * koTelling via `.totalt`) — ingen ny spørring, samme tall begge steder.
 * «I dag»-kortet bruker samme timeline som før (loadDailyBrief), nå vist
 * som FULL liste (ikke bare nå/neste).
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadDailyBrief } from "@/lib/agencyos/daily-brief-data";
import { lastGodkjenninger } from "@/lib/admin/ko/last-godkjenninger";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AgencyCockpitTrainLock } from "@/components/admin/cockpit/TrainLockCockpit";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hjem · AgencyOS" };

export default async function V2CockpitPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const [data, ko] = await Promise.all([
    loadDailyBrief({ id: user.id, name: user.name, avatarUrl: user.avatarUrl, role: user.role }),
    lastGodkjenninger({ id: user.id, role: user.role }),
  ]);

  // Klokke + dag formateres server-side i Oslo-tid: Vercel kjører UTC, så en
  // klient-beregnet klokke ville gitt hydreringsavvik (gotchas §Tidssone).
  const naa = new Date();
  const dagRaa = new Intl.DateTimeFormat("nb-NO", {
    timeZone: "Europe/Oslo",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(naa);
  const dayLabel = dagRaa.charAt(0).toUpperCase() + dagRaa.slice(1);
  const klokke = new Intl.DateTimeFormat("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  }).format(naa);

  return (
    <V2Shell bredde="full" hoyde="skjerm" aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AgencyCockpitTrainLock
        timeline={data.timeline}
        now={data.now}
        koTotalt={ko.totalt ?? ko.rows.length}
        koRader={ko.rows}
        dagLabel={dagRaa}
        dayLabel={dayLabel}
        klokke={klokke}
      />
    </V2Shell>
  );
}
