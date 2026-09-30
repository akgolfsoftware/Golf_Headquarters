/**
 * PH-21 Innboks · Spørsmål (/portal/coach/sporsmal/ny) i Precision Athletics.
 * Spilleren (eller forelderen) stiller spørsmål og ser egne spørsmål med status.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { innboksKontekst } from "@/lib/portal-okt/innboks-data";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH21Ramme, PH21SporsmalFane, type PH21Sporsmal } from "@/components/portal/precision/PH21Innboks";
import { stillSporsmalV2 } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Spørsmål · PlayerHQ" };

const OSLO = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", year: "numeric" });

export default async function NySporsmalPage({ searchParams }: { searchParams: Promise<{ sendt?: string }> }) {
  const user = await requirePortalUser({ allow: ["PLAYER", "PARENT"] });
  const { sendt } = await searchParams;
  const [ctx, rader] = await Promise.all([
    innboksKontekst(user.id),
    prisma.question.findMany({
      where: { askerUserId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, title: true, status: true, createdAt: true },
    }),
  ]);
  const mine: PH21Sporsmal[] = rader.map((q) => ({ id: q.id, tittel: q.title, besvart: q.status === "ANSWERED", tid: OSLO.format(q.createdAt).replaceAll("/", ".") }));
  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={ctx.uleste}>
      <PH21Ramme aktiv="q" coachNavn={ctx.coachNavn}>
        <PH21SporsmalFane mine={mine} sendt={sendt === "1"} still={stillSporsmalV2} />
      </PH21Ramme>
    </PlayerHQSkall>
  );
}
