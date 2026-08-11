/**
 * Logg en runde (etterregistrering) — /portal/runde/logg (fullscreen).
 * Paper-fasit: designsystem/paper/fase1/playerhq-runde-logg.html.
 * ÉN skjerm: dato + bane, «Hull for hull | Bare totalen», og de 2 siste
 * loggførte rundene (ekte data). KUN brutto score.
 */

import { requireConsentingUser } from "@/lib/auth/requireConsentingUser";
import { prisma } from "@/lib/prisma";
import { RundeEtterregistreringKlient } from "@/components/portal/runde-logg/runde-etterregistrering-klient";
import { sisteSpilteBaneId } from "@/lib/portal/siste-spilte-bane";
import { medForst } from "@/lib/portal/baneliste-med-prefill";

export const metadata = { title: "Logg en runde — AK Golf HQ" };

const OSLO_DATO = new Intl.DateTimeFormat("nb-NO", {
  day: "2-digit",
  month: "2-digit",
  timeZone: "Europe/Oslo",
});

export default async function RundeLoggPage() {
  const user = await requireConsentingUser();

  const [alleBaner, sisteBaneId, sisteRunder] = await Promise.all([
    prisma.courseDefinition.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    sisteSpilteBaneId(user.id),
    prisma.round.findMany({
      where: { userId: user.id },
      orderBy: { playedAt: "desc" },
      take: 2,
      select: { playedAt: true, score: true, course: { select: { name: true } } },
    }),
  ]);
  // Prefill (flytpakke 2, 2.5): sist spilte bane foreslås øverst.
  const baner = medForst(alleBaner, sisteBaneId);

  const siste = sisteRunder.map((r) => ({
    dato: OSLO_DATO.format(r.playedAt),
    bane: r.course.name,
    slag: r.score,
  }));

  return <RundeEtterregistreringKlient baner={baner} siste={siste} />;
}
