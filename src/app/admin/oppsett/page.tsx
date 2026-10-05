/**
 * Oppgaver & oppsett — AG-23 i Precision Athletics (/admin/oppsett).
 *
 * Én samlet adresse for profil, team, tilgang, varsler, integrasjoner,
 * markedsføring og virksomhetsinnstillinger.
 * Erstatter Train-lock-skallet med Precision Athletics (AgencyOSSkall og AG23Oppsett).
 *
 * TILGANG: gater ADMIN/COACH.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG23Oppsett } from "@/components/admin/precision/AG23Oppsett";
import { lastOppsettData } from "@/lib/admin/oppsett/last-oppsett-data";
import {
  synligeOppsettFaner,
  velgOppsettFane,
} from "@/lib/admin/oppsett/faner";

export const dynamic = "force-dynamic";
export const metadata = { title: "Oppsett · AgencyOS" };

export default async function OppsettPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { fane: onsket } = await searchParams;

  const faner = synligeOppsettFaner(user.role === "ADMIN");
  const aktiv = velgOppsettFane(onsket, faner);

  const faneMapp: Record<string, string> = {
    akademi: "team",
    klubb: "virks",
    kalender: "varsler",
    tilgang: "team",
    sikkerhet: "profil",
    integrasjoner: "integr",
    api: "integr",
    perioder: "virks",
    profil: "profil",
    team: "team",
    inviter: "inviter",
    ekstern: "ekstern",
    varsler: "varsler",
    integr: "integr",
    mark: "mark",
    virks: "virks",
  };

  const startFane = faneMapp[aktiv] ?? (onsket && faneMapp[onsket]) ?? "team";

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG23Oppsett data={await lastOppsettData(user)} startFane={startFane} />
    </AgencyOSSkall>
  );
}
