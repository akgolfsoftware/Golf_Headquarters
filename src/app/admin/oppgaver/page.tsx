/**
 * Oppgaver — AG-21 i Precision Athletics (/admin/oppgaver).
 *
 * Én samlet adresse for oppgaver, prosjekter, faste rutiner og Notion-synk.
 * Erstatter Train-lock-skallet med Precision Athletics (AgencyOSSkall og AG21Oppgaver).
 *
 * TILGANG: gater ADMIN/COACH.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG21Oppgaver } from "@/components/admin/precision/AG21Oppgaver";
import {
  synligeOppgaveFaner,
  velgOppgaveFane,
} from "@/lib/admin/oppgaver/faner";

export const dynamic = "force-dynamic";
export const metadata = { title: "Oppgaver · AgencyOS" };

export default async function OppgaverPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { fane: onsket } = await searchParams;

  const synlige = synligeOppgaveFaner(user.role === "ADMIN");
  const aktiv = velgOppgaveFane(onsket, synlige);

  const startFane =
    aktiv === "prosjekter"
      ? "prosj"
      : aktiv === "rutiner"
      ? "rutiner"
      : "mine";

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG21Oppgaver startFane={startFane} />
    </AgencyOSSkall>
  );
}
