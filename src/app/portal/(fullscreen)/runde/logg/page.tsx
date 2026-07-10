/**
 * Etterregistrering slag for slag — /portal/runde/logg (fullscreen).
 * Samme føringsklient som live-modusen, men med valgfri dato (runden er
 * allerede spilt). Full SG når hele kjeden føres.
 */

import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { RundeLoggKlient } from "@/components/portal/runde-logg/runde-logg-klient";

export const metadata = { title: "Før runde slag for slag — AK Golf HQ" };

export default async function RundeLoggPage() {
  await requireConsentingUser();

  const baner = await prisma.courseDefinition.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return <RundeLoggKlient modus="etterpaa" baner={baner} />;
}
