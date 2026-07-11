/**
 * PlayerHQ Slag-registrering — v2-ramme rundt SlagWizard + UpGameImportModal
 * (verktøyene er shadcn/tailwind og gjenbrukes som de er; kun sidens hode og
 * chrome er v2). Skrive-tilgang håndheves i actions (assertRoundOwner) —
 * kun rundens eier.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { Caps, Tittel, MikroMeta } from "@/components/v2";
import { T } from "@/lib/v2/tokens";
import { SlagWizard } from "../slag-wizard";
import { UpGameImportModal } from "../upgame-import-modal";

export const dynamic = "force-dynamic";

export default async function SlagRegistreringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser();
  const { id } = await params;

  const runde = await prisma.round.findUnique({
    where: { id },
    include: {
      course: { select: { name: true } },
      shots: { orderBy: [{ holeNumber: "asc" }, { shotNumber: "asc" }] },
    },
  });
  if (!runde) notFound();
  // Kun eieren registrerer slag (actions håndhever det samme ved skriving).
  if (runde.userId !== user.id) notFound();

  const datoTekst = runde.playedAt.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Oslo",
  });

  const serialiserteSlag = runde.shots.map((s) => ({
    id: s.id,
    holeNumber: s.holeNumber,
    holePar: s.holePar,
    shotNumber: s.shotNumber,
    club: s.club,
    lie: s.lie as string,
    distanceToPin: s.distanceToPin,
    distanceHit: s.distanceHit,
    windDir: s.windDir as string | null,
    shotType: s.shotType as string,
    isPenalty: s.isPenalty,
    notes: s.notes,
  }));

  return (
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Link
          href={`/portal/mal/runder/${id}`}
          style={{ textDecoration: "none", alignSelf: "flex-start" }}
        >
          <MikroMeta icon="arrow-left">Tilbake til runden</MikroMeta>
        </Link>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div>
            <Caps>
              {runde.course.name} · {datoTekst}
            </Caps>
            <div style={{ marginTop: 10 }}>
              <Tittel em="slag.">Slag for</Tittel>
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, margin: "10px 0 0" }}>
              Registrer hvert slag manuelt, eller importer fra UpGame.
            </p>
          </div>
          <UpGameImportModal roundId={id} />
        </div>

        <SlagWizard roundId={id} eksisterendeSlag={serialiserteSlag} />
      </div>
    </V2Shell>
  );
}
