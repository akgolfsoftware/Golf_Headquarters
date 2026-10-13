/** Reelt oppsett: bare valgt og tillatt fane hentes. Eksisterende handlinger beholdes. */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG23Oppsett } from "@/components/admin/precision/AG23Oppsett";
import { CoachContent } from "@/components/admin/precision/agency-completion/CoachContent";
import { synligeOppsettFaner, velgOppsettFane, oppsettHref } from "@/lib/admin/oppsett/faner";
import { lastAkademiData, lastKalenderData, lastSikkerhetData, lastKlubbData, sjekkKlubbTilgang, lastTilgangRoller, lastTilgangPerTrener, lastApiData, lastPerioderData, lastIntegrasjonerData } from "@/lib/admin/oppsett/lastere";
import { AdminOppsettHubTrainLock } from "@/components/admin/v2/oppsett/AdminOppsettHubTrainLock";
import { AdminKlubbInnstillingerTrainLock } from "@/components/admin/v2/oppsett/AdminKlubbInnstillingerTrainLock";
import { AdminKalenderSynkTrainLock } from "@/components/admin/v2/oppsett/AdminKalenderSynkTrainLock";
import { AdminSecurityTrainLock } from "@/components/admin/v2/oppsett/AdminSecurityTrainLock";
import { AdminTilgangTrainLock } from "@/components/admin/v2/oppsett/AdminTilgangTrainLock";
import { AdminTilgangPerTrenerTrainLock } from "@/components/admin/v2/oppsett/AdminTilgangPerTrenerTrainLock";
import { AdminApiKeysTrainLock } from "@/components/admin/v2/oppsett/AdminApiKeysTrainLock";
import { AdminIntegrasjonerTrainLock } from "@/components/admin/v2/oppsett/AdminIntegrasjonerTrainLock";
import { PeriodeNavnV2 } from "@/components/admin/v2/PeriodeNavnV2";
import { KnappLenke } from "@/components/precision/pa";

export const dynamic = "force-dynamic";
export const metadata = { title: "Oppsett · AgencyOS" };
export default async function OppsettPage({ searchParams }: { searchParams: Promise<{ fane?: string; rad?: string; ok?: string; error?: string }> }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const params = await searchParams;
  const faner = synligeOppsettFaner(user.role === "ADMIN");
  const aktiv = velgOppsettFane(params.fane, faner);
  // velgOppsettFane slipper ikke COACH inn på ADMIN-faner. Klubb beholder egen capability-vakt.
  const innhold = await (async () => {
    switch (aktiv) {
      case "akademi": return <AdminOppsettHubTrainLock data={await lastAkademiData(user)} rad={params.rad === "varsler" || params.rad === "konto" || params.rad === "akademi" ? params.rad : null} somFane baseHref="/admin/oppsett" />;
      case "klubb": { await sjekkKlubbTilgang(); const data = await lastKlubbData(); return <AdminKlubbInnstillingerTrainLock {...data} somFane />; }
      case "kalender": return <AdminKalenderSynkTrainLock data={await lastKalenderData(user.id, params.ok, params.error)} somFane />;
      case "sikkerhet": return <AdminSecurityTrainLock data={lastSikkerhetData(user)} somFane />;
      case "tilgang": { const data = lastTilgangRoller(); return <><AdminTilgangTrainLock {...data} somFane /><AdminTilgangPerTrenerTrainLock trenere={await lastTilgangPerTrener()} /></>; }
      case "api": return <AdminApiKeysTrainLock data={await lastApiData()} somFane />;
      case "perioder": return <PeriodeNavnV2 {...await lastPerioderData()} somFane />;
      case "integrasjoner": return <AdminIntegrasjonerTrainLock cards={await lastIntegrasjonerData(user)} somFane />;
    }
  })();
  return <AgencyOSSkall navn={user.name ?? "Coach"}><CoachContent>
    <AG23Oppsett faner={faner.map(f => ({ href: oppsettHref(f.id), navn: f.label, aktiv: f.id === aktiv }))}>{innhold}</AG23Oppsett>
    <KnappLenke href="/admin/profile" variant="secondary">Rediger egen profil</KnappLenke>
  </CoachContent></AgencyOSSkall>;
}
