/**
 * PlayerHQ · Ukesdigest (D3).
 * Fasit: designsystem/paper/fase2/playerhq/playerhq-ukesdigest.html
 *
 * Spillerens uke med samme tall og samme nevner som coachens ukesrapport.
 * Leser kun — ingenting på denne flaten skriver.
 */

import { redirect } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentUkesdigest } from "@/lib/portal/ukesdigest";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { UkesdigestV2 } from "@/components/portal/v2/UkesdigestV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Uka di · PlayerHQ" };

export default async function UkesdigestPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");

  const data = await hentUkesdigest(user.id);

  return (
    <V2Shell
      bredde="kolonne"
      aktiv="hjem"
      nav={PLAYERHQ_NAV}
      navn={user.name}
      avatarUrl={user.avatarUrl}
    >
      <UkesdigestV2 data={data} />
    </V2Shell>
  );
}
