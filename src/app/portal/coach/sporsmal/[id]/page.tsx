/**
 * PlayerHQ Coach · Spørsmål-tråd (/portal/coach/sporsmal/[id]) — v2.
 * Erstatter legacy /portal/(legacy)/coach/sporsmal/[id] som tråd-detaljen
 * lista (/portal/coach/sporsmal, allerede v2) lenker til. Auth + datahenting
 * speiler legacy-siden EKSAKT: samme Question-oppslag, samme spillernavn-
 * oppslag, samme svarPaSporsmal-server-action (uendret, importert fra legacy
 * og sendt inn som prop). Kun det visuelle er løftet til v2.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  CoachSporsmalTraadV2,
  type CoachSporsmalTraad,
} from "@/components/portal/v2/CoachSporsmalTraadV2";
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

  const asker = await prisma.user.findUnique({
    where: { id: question.askerUserId },
    select: { name: true },
  });
  const askerNavn = asker?.name ?? "Ukjent spiller";
  const besvart = question.status === "ANSWERED" && Boolean(question.answer);

  const data: CoachSporsmalTraad = {
    id: question.id,
    askerNavn,
    tittel: question.title,
    body: question.body,
    besvart,
    svar: besvart ? question.answer : null,
    stiltTid: formatDatoTid(question.createdAt),
    besvartTid: question.answeredAt ? formatDatoTid(question.answeredAt) : null,
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name}>
      <TilbakeLenke href="/portal/coach/sporsmal">Spørsmål</TilbakeLenke>
      <CoachSporsmalTraadV2 data={data} svarAction={svarPaSporsmal} />
    </V2Shell>
  );
}
