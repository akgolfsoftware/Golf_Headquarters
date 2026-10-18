// PlayerHQ Én utfordring — Precision Athletics, pakke 16 (utkast utfordringer.html, 16.10.2026).
/**
 * Bare eier, valgte deltakere og ADMIN slipper inn (ingen delbar lenke, 16.10.2026). Andre får 404,
 * så adressen ikke røper at utfordringen finnes. Handlingene sjekker tilgang på nytt.
 */
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getUnreadNotifications } from "@/app/portal/actions";
import { harTilgangTilUtfordring } from "@/lib/portal/utfordring-tilgang";
import { utfordringAkse } from "@/lib/portal/utfordring-akse";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHUtfordring, type UtfDetalj } from "@/components/portal/precision/PHUtfordringer";
import { avsluttUtfordring, registrerScore } from "@/app/portal/(legacy)/utfordringer/actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Utfordring · PlayerHQ" };

const DATO = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", weekday: "short", day: "numeric", month: "short" });

export default async function UtfordringPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const { id } = await params;
  if (!(await harTilgangTilUtfordring(id, user))) notFound();

  const utfordring = await prisma.drillChallenge.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true } },
      participants: {
        include: { user: { select: { name: true } } },
        orderBy: [{ rank: { sort: "asc", nulls: "last" } }, { joinedAt: "asc" }],
      },
    },
  });
  if (!utfordring) notFound();
  const [ovelse, uleste] = await Promise.all([
    utfordring.drillId ? prisma.exerciseDefinition.findUnique({ where: { id: utfordring.drillId }, select: { name: true, pyramidArea: true } }) : null,
    getUnreadNotifications(user.id, 1),
  ]);
  const meg = utfordring.participants.find((p) => p.userId === user.id);
  const periode = utfordring.startAt && utfordring.endAt
    ? `${DATO.format(utfordring.startAt)}–${DATO.format(utfordring.endAt)}`
    : utfordring.endAt ? `Til ${DATO.format(utfordring.endAt)}` : null;

  const data: UtfDetalj = {
    navn: utfordring.name, beskrivelse: utfordring.description, eierNavn: utfordring.owner.name ?? "—",
    ovelse: ovelse?.name ?? null, akse: utfordringAkse(ovelse?.pyramidArea),
    avsluttet: utfordring.status === "ENDED", periode,
    erEier: utfordring.ownerId === user.id || user.role === "ADMIN", erDeltaker: !!meg,
    higherIsBetter: utfordring.higherIsBetter, minScore: meg?.score ?? null, minNotes: meg?.notes ?? null,
    deltakere: utfordring.participants.map((p) => ({ id: p.id, navn: p.user.name ?? "—", erMeg: p.userId === user.id, rank: p.rank, score: p.score, notes: p.notes })),
  };

  async function avslutt() {
    "use server";
    await avsluttUtfordring(id);
  }
  async function score(verdi: number, notes: string | null) {
    "use server";
    await registrerScore(id, verdi, notes);
  }

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PHUtfordring data={data} handlinger={{ avslutt, registrerScore: score }} />
    </PlayerHQSkall>
  );
}
