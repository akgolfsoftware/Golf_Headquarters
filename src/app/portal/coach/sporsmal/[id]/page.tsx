// PH21SporsmalTraad — Precision Athletics, nytt design (pakke 11). Data og handlinger er beholdt.
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
/**
 * PlayerHQ Coach · Spørsmål-tråd (/portal/coach/sporsmal/[id]).
 * Fasit: docs/design-system/utkast-playerhq/kommunikasjon.html, mal «traad».
 * Avvik:
 *   - Avvikene fra utkastet står øverst i komponenten siden bruker.
 * Tråden vises bare for den som spurte, tildelt coach, admin, eller coach
 * med tilgang når spørsmålet ligger i åpen kø.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { kanSeSporsmal, kanSvarePaSporsmal } from "@/lib/portal-okt/coach-sporsmal-tilgang";
import { prisma } from "@/lib/prisma";
import { PH21SporsmalTraad, type PH21SporsmalTraadData } from "@/components/portal/precision/PH21SporsmalTraad";
import { svarPaSporsmal } from "@/app/portal/(legacy)/coach/sporsmal/actions";

export const dynamic = "force-dynamic";

type RouteProps = {
  params: Promise<{ id: string }>;
};

function formatDatoTid(d: Date): string {
  return d.toLocaleString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  });
}

export default async function CoachSporsmalTraadPage({ params }: RouteProps) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN", "PARENT"] });
  const { id } = await params;

  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) notFound();

  const harSpillerTilgang =
    user.role === "COACH" ? await harCoachTilgangTilSpiller(user, question.askerUserId) : false;
  if (
    !kanSeSporsmal({
      viewerId: user.id,
      viewerRole: user.role,
      askerUserId: question.askerUserId,
      coachUserId: question.coachUserId,
      harSpillerTilgang,
    })
  ) {
    notFound();
  }

  const asker = await prisma.user.findUnique({
    where: { id: question.askerUserId },
    select: { name: true },
  });
  const askerNavn = asker?.name ?? "Ukjent spiller";
  const besvart = question.status === "ANSWERED" && Boolean(question.answer);

  const data: PH21SporsmalTraadData = {
    id: question.id,
    askerNavn,
    tittel: question.title,
    body: question.body,
    besvart,
    svar: besvart ? question.answer : null,
    stiltTid: formatDatoTid(question.createdAt),
    besvartTid: question.answeredAt ? formatDatoTid(question.answeredAt) : null,
    erMeg: question.askerUserId === user.id,
    kanSvare: kanSvarePaSporsmal({
      viewerId: user.id,
      viewerRole: user.role,
      coachUserId: question.coachUserId,
      harSpillerTilgang,
    }),
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <PH21SporsmalTraad data={data} svarAction={svarPaSporsmal} tilbakeHref="/portal/coach/sporsmal" />
    </PlayerHQSkall>
  );
}
