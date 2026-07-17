/**
 * PlayerHQ Rediger hull-for-hull — v2-ramme rundt HullRedigerForm (rå
 * tailwind, delt editor med logge-flyten — D6a, 17. juli 2026). Kun rundens
 * eier (actions håndhever det samme ved skriving via assertRoundOwner).
 * Strokes Gained røres ikke her — SG beregnes fortsatt kun fra
 * slag-for-slag-kjeden.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { Caps, Tittel, MikroMeta, Kort } from "@/components/v2";
import { T } from "@/lib/v2/tokens";
import { HullRedigerForm } from "@/components/portal/runde-ny/hull-rediger-form";

export const dynamic = "force-dynamic";

export default async function RedigerHullPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser();
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

  return (
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Link
          href={`/portal/mal/runder/${runde.id}`}
          style={{ textDecoration: "none", alignSelf: "flex-start" }}
        >
          <MikroMeta icon="arrow-left">Tilbake til runden</MikroMeta>
        </Link>

        <div>
          <Caps>
            {runde.course.name} · {datoTekst}
          </Caps>
          <div style={{ marginTop: 10 }}>
            <Tittel em="hull for hull.">Rediger</Tittel>
          </div>
        </div>

        {/* Ærlighet: scorekortet er brutto tall; SG kommer fra slag-kjeden */}
        <Kort pad="12px 18px">
          <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: 0, lineHeight: 1.6 }}>
            Scorekortet er brutto tall per hull. Endrer du slag-tallet på et hull
            der slag-kjeden er ført, fjernes kjeden for det hullet — Strokes
            Gained beregnes kun fra en komplett slag-for-slag-kjede.
          </p>
        </Kort>

        <div style={{ maxWidth: 760 }}>
          <HullRedigerForm
            roundId={runde.id}
            coursePar={runde.course.par}
            initial={initial}
          />
        </div>
      </div>
    </V2Shell>
  );
}
