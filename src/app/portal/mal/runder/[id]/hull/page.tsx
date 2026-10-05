/**
 * PlayerHQ Rediger hull-for-hull — Precision Athletics-ramme rundt HullRedigerForm (rå
 * tailwind, delt editor med logge-flyten — D6a, 17. juli 2026; skjemaet er ikke tegnet om ennå). Kun rundens
 * eier (actions håndhever det samme ved skriving via assertRoundOwner).
 * Strokes Gained røres ikke her — SG beregnes fortsatt kun fra
 * slag-for-slag-kjeden.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { ArrowLeft } from "lucide-react";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { Ikon, Sidehode } from "@/components/precision/pa";
import { InlineVarsel } from "@/components/precision/pa-a5";

import { HullRedigerForm } from "@/components/portal/runde-ny/hull-rediger-form";

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
      <div className="pa-side" style={{ maxWidth: 800 }}>
        <Link href={`/portal/mal/runder/${runde.id}`} className="pa-btn pa-btn--ghost pa-btn--sm pa-btn--icon-l" style={{ alignSelf: "flex-start" }}>
          <Ikon icon={ArrowLeft} size={16} name="arrow-left" />Tilbake til runden
        </Link>
        <Sidehode kicker={`${runde.course.name} · ${datoTekst}`} title="Rediger hull for hull" />
        {/* Ærlighet: scorekortet er brutto tall; SG kommer fra slag-kjeden */}
        <InlineVarsel tone="info">
          Scorekortet er brutto tall per hull. Endrer du slag-tallet på et hull der slag-kjeden er ført, fjernes
          kjeden for det hullet. Strokes Gained beregnes kun fra en komplett slag-for-slag-kjede.
        </InlineVarsel>
        <HullRedigerForm roundId={runde.id} coursePar={runde.course.par} initial={initial} />
      </div>
    </PlayerHQSkall>
  );
}
