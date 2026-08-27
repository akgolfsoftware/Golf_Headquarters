/**
 * AgencyOS — Stall · dag (natt-plan bølge 2, Loop 6 / C2).
 *
 * Spillere som kolonner for én dag, UTKAST synlig, «Åpne uke i Workbench»
 * som eneste handling. Server component: auth + dagens data. All navigasjon
 * skjer via lenker til `/admin/workbench/[playerId]` — ingen skriving her.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { loadStallDag } from "@/lib/workbench/wb-actions";
import { StallDagV2, StallDagFeil } from "@/components/workbench/StallDagV2";
import { TL_SCOPE } from "@/components/workbench/wb-tl-scope";

export const dynamic = "force-dynamic";
export const metadata = { title: "Stall-dag · AgencyOS" };

type Props = {
  searchParams: Promise<{ dato?: string }>;
};

const ISO_DATO = /^\d{4}-\d{2}-\d{2}$/;

function osloIdag(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Oslo" }).format(new Date());
}

export default async function StallDagPage({ searchParams }: Props) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { dato: datoParam } = await searchParams;

  const idag = osloIdag();
  const dato = datoParam && ISO_DATO.test(datoParam) ? datoParam : idag;

  const res = await loadStallDag({ dato });

  return (
    <div style={TL_SCOPE}>
      <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? undefined}>
        {res.ok ? (
          <StallDagV2 dato={dato} data={res.data} erIdag={dato === idag} />
        ) : (
          <StallDagFeil melding={res.error} />
        )}
      </V2Shell>
    </div>
  );
}
