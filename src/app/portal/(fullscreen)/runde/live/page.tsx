/**
 * Live slag-for-slag-føring — /portal/runde/live (fullscreen, ingen shell).
 * Spilleren fører runden hull for hull på banen; kladd i localStorage,
 * SG beregnes server-side ved lagring (lagreLoggetRunde).
 */

import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { RundeLoggKlient } from "@/components/portal/runde-logg/runde-logg-klient";
import { sisteSpilteBaneId } from "@/lib/portal/siste-spilte-bane";
import { medForst } from "@/lib/portal/baneliste-med-prefill";

export const metadata = { title: "Live-føring — AK Golf HQ" };

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

  return <RundeLoggKlient modus="live" baner={baner} />;
}
