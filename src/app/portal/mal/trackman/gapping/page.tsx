// PH17Gapping — Precision Athletics. Data og handlinger er beholdt. Ikke målt i appen.
/**
 * PlayerHQ · Gapping (D5).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-gapping.html
 * Avvik:
 *   - Skallet er Precision. Indre visning er fortsatt v2. Papir-tegningen er ikke visuell fasit.
 *
 * Ligger under TrackMan fordi tallene kommer derfra — fasiten lenker tilbake
 * til TrackMan-lista. Leser kun.
 */

import { redirect } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentGapping } from "@/lib/portal/gapping-data";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { GappingV2 } from "@/components/portal/v2/GappingV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Gapping · PlayerHQ" };

export default async function GappingPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");

  const data = await hentGapping(user.id);

  return (
        <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
      <GappingV2 data={data} />
          </div>
    </PlayerHQSkall>
  );
}
