/**
 * PH-24d Utfordring-detalj — Precision Athletics. Auth + dataloader gjenbrukt 1:1 fra
 * legacy-skjermen; server-actions (bliMed/avslutt/registrerScore) sendes ned
 * som props. PlayerHQSkall eier chrome-en, PH24dDetalj rendrer innholdet.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH24dDetalj, type PH24dDetaljData } from "@/components/portal/precision/PH24dUtfordringer";
import { datoLang } from "@/lib/portal/utfordring-visning";
import {
  bliMed,
  avsluttUtfordring,
  registrerScore,
} from "@/app/portal/(legacy)/utfordringer/actions";

export const dynamic = "force-dynamic";

export default async function UtfordringDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { id } = await params;

  const utfordring = await prisma.drillChallenge.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true } },
      participants: {
        include: { user: { select: { id: true, name: true } } },
        orderBy: [
          { rank: { sort: "asc", nulls: "last" } },
          { score: { sort: "desc", nulls: "last" } },
          { joinedAt: "asc" },
        ],
      },
    },
  });
  if (!utfordring) notFound();

  let drill: { id: string; name: string } | null = null;
  if (utfordring.drillId) {
    drill = await prisma.exerciseDefinition.findUnique({
      where: { id: utfordring.drillId },
      select: { id: true, name: true },
    });
  }

  const minDeltakelse = utfordring.participants.find((p) => p.userId === user.id);

  const uleste = await prisma.notification.count({ where: { userId: user.id, readAt: null } });

  const data: PH24dDetaljData = {
    id: utfordring.id,
    navn: utfordring.name,
    beskrivelse: utfordring.description,
    eierNavn: utfordring.owner.name ?? "Ukjent",
    ovelseNavn: drill?.name ?? null,
    avsluttet: utfordring.status === "ENDED",
    start: datoLang(utfordring.startAt),
    slutt: datoLang(utfordring.endAt),
    erEier: utfordring.ownerId === user.id,
    erDeltaker: !!minDeltakelse,
    minScore: minDeltakelse?.score ?? null,
    minNotes: minDeltakelse?.notes ?? null,
    higherIsBetter: utfordring.higherIsBetter,
    deltakere: utfordring.participants.map((p) => ({
      id: p.id,
      navn: p.user.name ?? "Uten navn",
      erMeg: p.userId === user.id,
      rank: p.rank,
      score: p.score,
      notes: p.notes,
    })),
  };

  async function bliMedAction() {
    "use server";
    await bliMed(id);
  }

  async function avsluttAction() {
    "use server";
    await avsluttUtfordring(id);
  }

  async function registrerScoreAction(score: number, notes: string | null) {
    "use server";
    await registrerScore(id, score, notes);
  }

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste}>
      <PH24dDetalj
        tilstand="data"
        data={data}
        actions={{ bliMed: bliMedAction, avslutt: avsluttAction, registrerScore: registrerScoreAction }}
      />
    </PlayerHQSkall>
  );
}
