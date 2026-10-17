// PlayerHQ Utfordringer — Precision Athletics, pakke 16 (utkast utfordringer.html, 16.10.2026).
/**
 * Utfordringer der brukeren er eier eller deltaker. Utfordringer teller ikke som trening.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { getUnreadNotifications } from "@/app/portal/actions";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PHUtfordringer, type UtfKort } from "@/components/portal/precision/PHUtfordringer";
import { utfordringAkse } from "@/lib/portal/utfordring-akse";

export const dynamic = "force-dynamic";
export const metadata = { title: "Utfordringer · PlayerHQ" };

const DATO = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" });

export default async function UtfordringerPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const [utfordringer, uleste] = await Promise.all([
    prisma.drillChallenge.findMany({
      where: { OR: [{ ownerId: user.id }, { participants: { some: { userId: user.id } } }] },
      include: { participants: { select: { userId: true, rank: true, score: true } } },
      orderBy: { createdAt: "desc" },
    }),
    getUnreadNotifications(user.id, 1),
  ]);
  const drillIder = [...new Set(utfordringer.map((u) => u.drillId).filter((d): d is string => !!d))];
  const ovelser = drillIder.length
    ? await prisma.exerciseDefinition.findMany({ where: { id: { in: drillIder } }, select: { id: true, name: true, pyramidArea: true } })
    : [];
  const ovelse = new Map(ovelser.map((o) => [o.id, o]));

  const tilKort = (u: (typeof utfordringer)[number]): UtfKort => {
    const meg = u.participants.find((p) => p.userId === user.id);
    const o = u.drillId ? ovelse.get(u.drillId) : undefined;
    return {
      id: u.id, navn: u.name, akse: utfordringAkse(o?.pyramidArea), ovelse: o?.name ?? null, antall: u.participants.length,
      minPlass: meg?.rank ?? null, minScore: meg?.score ?? null,
      slutter: u.endAt ? DATO.format(u.endAt) : null,
      avsluttetDato: u.status === "ENDED" && u.endAt ? DATO.format(u.endAt) : null,
    };
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PHUtfordringer
        aktive={utfordringer.filter((u) => u.status === "ACTIVE").map(tilKort)}
        avsluttede={utfordringer.filter((u) => u.status === "ENDED").map(tilKort)}
        kanOpprette={user.role !== "PLAYER" || user.tilgang.nivaa === "FULL"}
      />
    </PlayerHQSkall>
  );
}
