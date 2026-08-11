/**
 * Live runde-føring — /portal/runde/live (fullscreen, ingen shell).
 * Paper-fasit: designsystem/paper/fase1/playerhq-runde-live.html.
 * Stepper per hull er standardinngangen; slag-for-slag-detaljen er beholdt
 * bak hullet. Kladd i localStorage, SG beregnes server-side ved lagring.
 */

import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { RundeLiveKlient } from "@/components/portal/runde-logg/runde-live-klient";
import { sisteSpilteBaneId } from "@/lib/portal/siste-spilte-bane";
import { medForst } from "@/lib/portal/baneliste-med-prefill";

export const metadata = { title: "Runde live — AK Golf HQ" };

export default async function RundeLivePage() {
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

  return <RundeLiveKlient baner={baner} />;
}
