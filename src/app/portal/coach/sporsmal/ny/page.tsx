// PH21NyttSporsmal — Precision Athletics. Data og handlinger er beholdt. Ikke målt i appen.
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
/**
 * PlayerHQ Coach · Nytt spørsmål (/portal/coach/sporsmal/ny) — v2.
 * Erstatter legacy /portal/(legacy)/coach/sporsmal/ny som spillerens inngang
 * (lenket fra CoachMeldingerV2 sin «Still spørsmål»-CTA, som allerede pekte
 * hit). Auth + datahenting speiler legacy-siden: PLAYER/PARENT stiller
 * spørsmål, samme Question-modell, samme «mine spørsmål»-liste.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { TilbakeLenke } from "@/components/v2";
import { CoachSporsmalNyV2, type MinSporsmal } from "@/components/portal/v2/CoachSporsmalNyV2";
import { stillSporsmalV2 } from "./actions";

export const dynamic = "force-dynamic";

function formatDatoTid(d: Date): string {
  return d.toLocaleString("nb-NO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Oslo",
  });
}

export default async function NySporsmalPage({
  searchParams,
}: {
  searchParams: Promise<{ sendt?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });
  const { sendt } = await searchParams;

  const mineSporsmal = await prisma.question.findMany({
    where: { askerUserId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, title: true, status: true, createdAt: true },
  });

  const mine: MinSporsmal[] = mineSporsmal.map((q) => ({
    id: q.id,
    tittel: q.title,
    besvart: q.status === "ANSWERED",
    tid: formatDatoTid(q.createdAt),
  }));

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
      <TilbakeLenke href="/portal/coach/melding">Meldinger</TilbakeLenke>
      <CoachSporsmalNyV2 data={{ sendt: sendt === "1", mine }} sendAction={stillSporsmalV2} />
    </div>
    </PlayerHQSkall>
  );
}
