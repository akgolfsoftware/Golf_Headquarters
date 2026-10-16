// PH26PutteLab — Precision Athletics. Data og handlinger er beholdt. Ikke målt i appen.
/**
 * PlayerHQ · Putte-laboratoriet (/portal/trening/putte-laboratoriet) — v2.
 * v2-port 17. juli 2026 (Team D2): `PutteLabV2` erstatter legacy
 * putte-lab-client, ruten flyttet ut av (legacy). All putt-fysikk/-sannsynlighet
 * kommer fortsatt uendret fra @/lib/putt-core — kun presentasjonslaget er nytt
 * (og legacy-filens 25 rå hex er borte).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PutteLabV2 } from "@/components/portal/v2/PutteLabV2";

export const dynamic = "force-dynamic";

export default async function PutteLaboratorietPage() {
  await requirePortalUser();

  return (
        <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
      <PutteLabV2 />
          </div>
    </PlayerHQSkall>
  );
}
