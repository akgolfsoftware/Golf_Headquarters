/**
 * PlayerHQ Rediger hull for hull (/portal/mal/runder/[id]/hull) i nytt design (PHRD09RedigerHull, pakke 11).
 * Fasit: docs/design-system/utkast-playerhq/runder.html, malen «rediger». Avvikene står i komponenten.
 * Avvik:
 *   - Avvikene fra utkastet står øverst i komponenten siden bruker.
 * Kun rundens eier (actions håndhever det samme ved skriving via assertRoundOwner).
 * Strokes Gained røres ikke her — SG beregnes fortsatt kun fra slag-for-slag-kjeden.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHRD09RedigerHull } from "@/components/portal/precision/PHRD09RedigerHull";

export const dynamic = "force-dynamic";

export default async function RedigerHullPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const { id } = await params;

  const runde = await prisma.round.findUnique({
    where: { id },
    include: {
      course: { select: { name: true, par: true } },
      holeScores: { orderBy: { holeNumber: "asc" } },
    },
  });
  if (!runde) notFound();
  // Kun eieren redigerer scorekortet (actions håndhever det samme).
  if (runde.userId !== user.id) notFound();

  const datoTekst = runde.playedAt.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Oslo",
  });

  const initial = runde.holeScores.map((h) => ({
    nr: h.holeNumber,
    par: h.par,
    strokes: h.strokes,
    putts: h.putts,
    fairway: h.fairway,
    gir: h.gir,
  }));

  const uleste = await prisma.notification.count({ where: { userId: user.id, readAt: null } });

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PHRD09RedigerHull roundId={runde.id} baneNavn={runde.course.name} dato={datoTekst} coursePar={runde.course.par} initial={initial} />
    </PlayerHQSkall>
  );
}
