/**
 * Etterregistrering slag for slag — /portal/runde/logg (fullscreen).
 * Samme føringsklient som live-modusen, men med valgfri dato (runden er
 * allerede spilt). Full SG når hele kjeden føres.
 */

import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { RundeLoggKlient } from "@/components/portal/runde-logg/runde-logg-klient";
import { sisteSpilteBaneId } from "@/lib/portal/siste-spilte-bane";
import { medForst } from "@/lib/portal/baneliste-med-prefill";

export const metadata = { title: "Før runde slag for slag — AK Golf HQ" };

export default async function RundeLoggPage() {
  const user = await requireConsentingUser();

  const [alleBaner, sisteBaneId] = await Promise.all([
    prisma.courseDefinition.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    sisteSpilteBaneId(user.id),
  ]);
  // Prefill (flytpakke 2, 2.5): sist spilte bane foreslås øverst.
  const baner = medForst(alleBaner, sisteBaneId);

  return <RundeLoggKlient modus="etterpaa" baner={baner} />;
}
