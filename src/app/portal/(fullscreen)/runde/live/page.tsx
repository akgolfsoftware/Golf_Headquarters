/**
 * Live slag-for-slag-føring — /portal/runde/live (fullscreen, ingen shell).
 * Spilleren fører runden hull for hull på banen; kladd i localStorage,
 * SG beregnes server-side ved lagring (lagreLoggetRunde).
 */

import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { RundeLoggKlient } from "@/components/portal/runde-logg/runde-logg-klient";

export const metadata = { title: "Live-føring — AK Golf HQ" };

export default async function RundeLivePage() {
  await requireConsentingUser();

  const baner = await prisma.courseDefinition.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return <RundeLoggKlient modus="live" baner={baner} />;
}
