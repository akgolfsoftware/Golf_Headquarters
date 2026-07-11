/**
 * PlayerHQ Utfordring-detalj — v2. Auth + dataloader gjenbrukt 1:1 fra
 * legacy-skjermen; server-actions (bliMed/avslutt/registrerScore) sendes ned
 * som props. V2Shell eier chrome-en, UtfordringDetaljV2 rendrer innholdet.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import {
  UtfordringDetaljV2,
  type UtfordringDetaljData,
} from "@/components/portal/v2/UtfordringDetaljV2";
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

  const data: UtfordringDetaljData = {
    id: utfordring.id,
    name: utfordring.name,
    description: utfordring.description,
    eierNavn: utfordring.owner.name ?? "(ukjent)",
    drillNavn: drill?.name ?? null,
    status: utfordring.status,
    startAt: utfordring.startAt,
    endAt: utfordring.endAt,
    erEier: utfordring.ownerId === user.id,
    erDeltaker: !!minDeltakelse,
    minScore: minDeltakelse?.score ?? null,
    minNotes: minDeltakelse?.notes ?? null,
    deltakere: utfordring.participants.map((p) => ({
      id: p.id,
      navn: p.user.name ?? "(uten navn)",
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
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <UtfordringDetaljV2
        data={data}
        actions={{
          bliMed: bliMedAction,
          avslutt: avsluttAction,
          registrerScore: registrerScoreAction,
        }}
      />
    </V2Shell>
  );
}
