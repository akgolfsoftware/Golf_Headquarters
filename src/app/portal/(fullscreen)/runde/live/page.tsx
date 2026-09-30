/**
 * Live runde-føring — /portal/runde/live (fullscreen, ingen shell).
 * Fasit: Precision Athletics PH-RD-02/03/04/05/08 (Claude Design 7d7c2994,
 * runde 24). Oppsett, føring (slag for slag eller bare score) og ferdig-skjerm
 * styres av PHRDLive. Kladd i localStorage, SG beregnes server-side ved lagring.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PHRDLive } from "@/components/portal/precision/PHRDLive";
import { sisteSpilteBaneId } from "@/lib/portal/siste-spilte-bane";
import { medForst } from "@/lib/portal/baneliste-med-prefill";

export const metadata = { title: "Runde live — AK Golf HQ" };

export default async function RundeLivePage() {
  // (fullscreen)-layouten krever kun innlogging (17.08) — tilgangsnivået
  // håndheves her. Runde-føring står ikke på talent-allowlisten: FULL.
  // requirePortalUser dekker også foreldresamtykket requireConsentingUser
  // gjorde før, men REDIRECTER til venterommet i stedet for å kaste — riktig
  // for en side (requireConsentingUser er skrevet for server actions).
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });

  const [alleBaner, sisteBaneId] = await Promise.all([
    prisma.courseDefinition.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    sisteSpilteBaneId(user.id),
  ]);
  // Prefill (flytpakke 2, 2.5): sist spilte bane foreslås øverst.
  const baner = medForst(alleBaner, sisteBaneId);

  return <PHRDLive baner={baner} />;
}
