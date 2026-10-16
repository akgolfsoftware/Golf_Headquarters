/**
 * AgencyOS Økonomi — AG-20 i Precision Athletics.
 *
 * Tripletex-lesing. FORFALT fra Stripe. Ingen Invoice-migrasjon. Server component.
 *
 * Bare for head coach (ADMIN): beslutninger.md §ØKONOMI BARE FOR HEAD COACH …
 * (Anders 28.09.2026). Tidligere slapp COACH også inn — nå redirectes COACH
 * til Cockpit, låst av src/lib/agencyos/okonomi-tilgang.test.ts.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AG20Okonomi } from "@/components/admin/precision/AG20Okonomi";
import { hentOkonomiFlate } from "@/lib/admin/okonomi-data";
import { harTilgangTilOkonomi } from "@/lib/agencyos/okonomi-tilgang";

export const dynamic = "force-dynamic";
export const metadata = { title: "Økonomi · AgencyOS" };

export default async function V2AdminOkonomiPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  if (!harTilgangTilOkonomi(user.role)) redirect("/admin/agencyos");
  const data = await hentOkonomiFlate({ id: user.id, role: user.role });
  const tomt =
    !data.tripletexKonfigurert && data.fakturaer.length === 0 && data.ytd.resultatKr == null;

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG20Okonomi tilstand={tomt ? "tom" : "data"} data={data} />
    </AgencyOSSkall>
  );
}
